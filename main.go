package main

import (
	"html/template"
	"log"
	"net/http"
)

func rootHandler(writer http.ResponseWriter, request *http.Request) {
	type RootPageContext struct {
		Title   string
		Message string
	}

	context := RootPageContext{Title: "Algorithms Animator", Message: "Hello World :D"}
	template, _ := template.ParseFiles("view/main.html")
	template.Execute(writer, context)
}

func main() {
	http.Handle("/static/", http.FileServer(http.Dir("./")))
	http.HandleFunc("/", rootHandler)
	http.HandleFunc("/dijkstra", ajaxDijkstra)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
