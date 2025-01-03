package main

import (
	"fmt"
	"net"
	"os"
)

func handleConnection(connection net.Conn, server *Server) {
	server.addConnection(connection)
	defer connection.Close()
	defer server.removeConnection(connection)

	fmt.Println("Новое соединение:", connection.RemoteAddr())

	// Создаем буфер для чтения данных от клиента
	buffer := make([]byte, 1024)

	for {
		n, err := connection.Read(buffer)
		if err != nil {
			fmt.Println("Клиент отключился:", connection.RemoteAddr())
			return
		}

		data := buffer[:n]

		server.broadcast(data, connection)
	}
}

func main() {
	server := NewServer()

	port := os.Getenv("PORT")

	listener, err := net.Listen("tcp", ":" + port)
	if err != nil {
		fmt.Println("Ошибка при создании сервера:", err)
		return
	}
	defer listener.Close()

	fmt.Printf("Сервер запущен на порту %s...", port)

	// Ожидаем подключения клиентов
	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Ошибка при подключении клиента:", err)
			continue
		}

		// Обрабатываем каждого клиента в отдельной горутине
		go handleConnection(conn, server)
	}
}
