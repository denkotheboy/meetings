package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/coder/websocket"
)

// Структура для сообщений
type Message struct {
	Type string `json:"type"` // Тип сообщения (offer, answer, candidate)
	Data string `json:"data"` // Данные сообщения
}

// Клиенты
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)
var mu sync.Mutex

func main() {
	port := os.Getenv("PORT")

	http.HandleFunc("/", handleWebSocket)

	// Обработка сообщений
	go handleMessages()

	// Запуск HTTP-сервера
	fmt.Println("Сигнальный сервер запущен на :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Обновление соединения до WebSocket
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		CompressionMode: websocket.CompressionDisabled,
	})
	if err != nil {
		log.Println("Ошибка подключения WebSocket:", err)
		return
	}
	defer conn.Close(websocket.StatusInternalError, "закрытие соединения")

	// Регистрация клиента
	mu.Lock()
	clients[conn] = true
	mu.Unlock()

	log.Println("Клиент подключён:", r.RemoteAddr)

	// Чтение сообщений
	for {
		var msg Message
		err := readJSON(conn, &msg)
		if websocket.CloseStatus(err) == websocket.StatusNormalClosure {
			log.Println("Клиент отключился:", r.RemoteAddr)
			break
		} else if err != nil {
			log.Println("Ошибка чтения сообщения:", err)
			break
		}

		// Отправка сообщения в канал
		broadcast <- msg
	}

	// Удаление клиента
	mu.Lock()
	delete(clients, conn)
	mu.Unlock()
}

func handleMessages() {
	for {
		// Получаем сообщение из канала
		msg := <-broadcast

		// Рассылаем сообщение всем подключённым клиентам
		mu.Lock()
		for client := range clients {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			err := writeJSON(ctx, client, msg)
			if err != nil {
				log.Println("Ошибка отправки сообщения:", err)
				client.Close(websocket.StatusInternalError, "Ошибка отправки")
				delete(clients, client)
			}
		}
		mu.Unlock()
	}
}

func readJSON(conn *websocket.Conn, v interface{}) error {
	_, data, err := conn.Read(context.Background())
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

func writeJSON(ctx context.Context, conn *websocket.Conn, v interface{}) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return conn.Write(ctx, websocket.MessageText, data)
}
