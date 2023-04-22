package main

import (
	"algorithms-animator/server"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strconv"
)

const _PORT int = 3001

func rootHandler(writer http.ResponseWriter, request *http.Request) {
	type RootPageContext struct {
		Title   string
		Message string
	}

	context := RootPageContext{Title: "Algorithms Animator", Message: "Hello World :D"}
	template, _ := template.ParseFiles("client/view/main.html")
	template.Execute(writer, context)
}

func main() {
	fmt.Printf("Starting service... - [localhost:%v]\n", _PORT)
	http.Handle("/client/static/", http.FileServer(http.Dir("./")))
	http.HandleFunc("/", rootHandler)
	http.HandleFunc("/dijkstra", server.AjaxDijkstra)
	http.HandleFunc("/a-star", server.AjaxAStar)
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(_PORT), nil))
}
