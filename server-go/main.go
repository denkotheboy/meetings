package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/coder/websocket"
)

// Клиенты
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan []byte)
var mu sync.Mutex

func main() {
	port := os.Getenv("PORT")

	http.HandleFunc("/", handleWebSocket)

	// Обработка сообщений
	go handleMessages()

	// Запуск HTTP-сервера
	fmt.Println("Сигнальный сервер запущен на :", port)
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
		_, data, err := conn.Read(context.Background())
		if websocket.CloseStatus(err) == websocket.StatusNormalClosure {
			log.Println("Клиент отключился:", r.RemoteAddr)
			break
		} else if err != nil {
			log.Println("Ошибка чтения сообщения:", err)
			break
		}

		// Отправка сообщения в канал
		broadcast <- data
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
			err := client.Write(ctx, websocket.MessageBinary, msg)
			if err != nil {
				log.Println("Ошибка отправки сообщения:", err)
				client.Close(websocket.StatusInternalError, "Ошибка отправки")
				delete(clients, client)
			}
		}
		mu.Unlock()
	}
}
