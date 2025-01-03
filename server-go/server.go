package main

import (
	"net"
	"sync"
)

type Server struct {
	connections []net.Conn
	mu          sync.Mutex
}

func NewServer() *Server {
	return &Server{
		connections: make([]net.Conn, 0),
	}
}

func (s *Server) addConnection(connection net.Conn) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.connections = append(s.connections, connection)
}

func (s *Server) removeConnection(connection net.Conn) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, conn := range s.connections {
		if conn == connection {
			s.connections = append(s.connections[:i], s.connections[i+1:]...)
			break
		}
	}
}

func (s *Server) broadcast(message []byte, excludeConn net.Conn) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, connection := range s.connections {
		if connection != excludeConn {
			_, error := connection.Write(message)
			if error != nil {
				return error
			}
		}
	}

	return nil
}
