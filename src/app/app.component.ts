import { Component, OnInit } from '@angular/core';
import { markParentViewsForCheck } from '@angular/core/src/view/util';
import { FormControl } from '@angular/forms';
import { analyzeAndValidateNgModules } from '@angular/compiler';
declare const d3;
declare var graph;
declare var rootNode;
@Component({
  
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(){
    
  }
 graph: any;
rootNode:any;
  nodes: any;
  /*  data = [
     { name: "mario", parent: "knean" },
     { name: "knean" },
     { name: "gay", parent: "knean" },
     { name: "fag", parent: "knean" }
   ] */

  data = []
  title = 'milosWebsite';
  selected = 'aaa';
  name = new FormControl('Bob')
  ammount = new FormControl('10')
  users: string[] = []
  makeTransaction(event) {
    let ammount = this.ammount.value
    let name = this.name.value
    //if user is new add user to the list
    if (!this.users.indexOf(name)) {
      this.users.push(name)
    }
    // claim nodes

    let index = 0
    while (ammount > 0 && index <this.data.length) {
      console.log(name, ammount)

       if (!this.data[index].hasOwnProperty("owner")) {
        this.data[index].owner = name;
        ammount-=1;
        
        
      }
      index+=1; 
    }
    console.log(this.data)
this.update()
  }
  update() {
    var accent = d3.scaleOrdinal(d3.schemeAccent);
    var colours = accent(this.users)
    console.log(colours)
    this.graph.selectAll('.node').remove();
    this.graph.selectAll('.link').remove();


    // stratify the data
    this.rootNode = d3.stratify()

      .id(function (d) {
        return d.id
      })
      .parentId(function (d) {
        return d.parent;
      })
      (this.data)

    //stratified data -> tree form data
    var treeData = d3.tree().size([1400, 800])(this.rootNode)
    //create the selection of nodes from the tree data descendants
    this.nodes = this.graph.selectAll('.node')
      .data(treeData.descendants())
    // save the links data from the stratified data
    var links = this.graph.selectAll('.link').data(this.rootNode.links())

    // draw the links as path elements
    links.enter().append('path')
      .attr('stroke', 'blue')
      .attr('d', d3.linkHorizontal()
        .x(function (d) { return d.y; })
        .y(function (d) { return d.x; }))
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#aaa')
      .attr('stroke-width', 2)

    // add a group for each node with the specified coordinates
    var enterNodes = this.nodes.enter().append('g')
      .attr('transform', (d, i, n) => {
        let x = d.y
        let y = d.x
        return `translate(${x},${y})`
      })
      .attr('class', "node")

    // draw rectangles in each node group
    var rectangles = enterNodes.append('rect')
      .attr('fill', 'red')
      .attr('stroke', 'black')
      .attr('width', 30)
      .attr('height', 30)
      .attr('transform', d => `translate(${-5}, ${-10})`).raise();
    // add a click event on each rectangle
    rectangles.on("click", (d) => {
      console.log(d)
      this.selected = d.data.name;
    })

    // add text to each of the node groups
    enterNodes.append('text')
      .text((d) => { return d.data.id })
      .attr('fill', "black")
      .attr('transform', d => `translate(${2}, ${10})`);
    this.nodes.exit().remove()
  }

  ngOnInit() {


    this.data.push({ id: 1, parent: null })
    this.data.push({ id: 2, parent: 1 })
    for (let i = 3; i < 64; i++) {
      if (i % 2 == 0) {

        this.data.push({ id: i, parent: i / 2 % 2 == 0 ? i / 2 : i / 2 - 1 })
      }
      else {
        let parentNumber = Math.round(i / 2)
        this.data.push({ id: i, parent: parentNumber % 2 != 0 ? parentNumber : parentNumber - 1 })
      }
    }
    console.log(this.data)
    //define dimensions
    const dims = { height: 1400, width: 800 };
    //create the svg element
    const svg = d3.select('.canvas')
      .append('svg')
      .attr('width', dims.width + 100)
      .attr('height', dims.height + 100);
    //add the group element that will contain all the drawings of the graph
    
    this.graph = svg.append('g')
      .attr('transform', 'translate(50, 50)');

    this.update()


  }


}

