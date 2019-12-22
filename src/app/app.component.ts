import { Component, OnInit } from '@angular/core';
import { markParentViewsForCheck } from '@angular/core/src/view/util';
import { FormControl } from '@angular/forms';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { element } from '@angular/core/src/render3';
declare const d3;
declare var graph;
declare var rootNode;
@Component({

  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor() {

  }
  graph: any;
  rootNode: any;
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
  users: any[] = []
  findAllChildren(index) {
    let mario = this
    function produceIndexes(items) {
      
      let indexlist = []
      items.forEach((item) => {
        indexlist.push(
          mario.data.findIndex((node) => {
            return node.id == item
          }))
      })
      return indexlist
    }
    var iteration = 0
    var childrenList = []
    var childstack = []

    childstack = produceIndexes(this.data[index].children)
    
    childrenList = childrenList.concat(this.data[index].children)

    while (childstack.length > 0 && iteration < 1000) {
      
      var current = childstack.pop()
       if (this.data[current].children) {
        childstack = childstack.concat(produceIndexes(this.data[current].children))
        
        childrenList = childrenList.concat(this.data[current].children)
        
      }
      iteration++
    }
    childrenList = childrenList.sort((a, b) => a - b)
    return childrenList

  }

  makeTransaction(event) {
    let outerThis = this
    this.data.sort((a, b) => a.id - b.id)


    let ammount = this.ammount.value
    let name = this.name.value
    let userIndex = this.users.findIndex((user) => user.name == name)
    //if user is new add user to the list
    if (userIndex < 0) {

      this.users.push({ name: name, nodes: [] })
      userIndex = this.users.length - 1
   
    }
    // claim nodes
    // data filtered by children
    // make that data the 

    function assignFreeNode(userIndex) {

      let index = 0
      while (index < outerThis.data.length) {
        let currentNode = outerThis.data[index]

        if (!currentNode.hasOwnProperty("owner")) {
          outerThis.data[index].owner = name;
          outerThis.users[userIndex].nodes.push(currentNode.id)

          return

        }
        index += 1;
      }
      throw ("no nodes found")
    }

    if (this.users[userIndex].nodes.length == 0) {
      // fix this with a try catch block

      assignFreeNode(userIndex)
      ammount--
    }

    let nodeIndex = this.data.findIndex(
      (element) => element.id == this.users[userIndex].nodes[0]
    )
 //nodeIndex = 11

    let freeChildren: any = this.findAllChildren(nodeIndex)
    let virtualData = JSON.parse(JSON.stringify(this.data))
  
    virtualData[nodeIndex].virtualId = 1
    console.log(freeChildren.length,"freechildren length")
    for( let index = 0;index <freeChildren.length;index++){
    //freeChildren.forEach((element, index, array) => {
      var parent:any
      let originalElement = virtualData[index + 1]
  //same parent
  if (index>1){
     parent = virtualData.find((parent) => 
    { return parent.virtualId == originalElement.parent.id
      && parent.position == originalElement.parent.position})

     
  }else{
    parent = virtualData[nodeIndex]
  }
  //console.log(originalElement.parent, parent, "original parent + doppelganger parent")
  let childElementIndex = virtualData.findIndex((item) => {
    return item.parent.id == parent.id
    //same position
      && item.position == originalElement.position
    }) 
      virtualData[childElementIndex].virtualId = index + 2
    console.log(originalElement, virtualData[childElementIndex], " original + doppelganger")
    }
    //id top child = 1 id top child




    //asign indexes to children

    //

    let index = 0

let indexedNodes = virtualData.filter((element)=>element.hasOwnProperty("virtualId"))
.sort((a,b)=>a.virtualId-b.virtualId)
console.log(indexedNodes, "indexed nodes")
console.log(virtualData)
    while (ammount > 0 && index < indexedNodes.length) {
      let dataIndex = this.data.findIndex((element) => {
        return element.id == indexedNodes[index].id
      })

      let dataNode = this.data[dataIndex]
      console.log(dataIndex, ammount)

      if (!dataNode.hasOwnProperty("owner")) {
        this.data[dataIndex].owner = name;
        ammount -= 1;


      }
      index += 1;
    }
    console.log(this.data)
    this.update()
  }
  update() {

    //sort the data 
    let oddNodes = this.data.filter((element) => {
      return element.id % 2 == 1
    }).sort((a, b) => b.id - a.id)
    console.log(oddNodes, "these are the odd nodes")

    this.data = this.data.filter((element, index, array) => {
      //element.id % 2 ==1 && element.id >1
      return element.id % 2 == 0
    }).sort()
    console.log(this.data.sort(), "spliced data")
    this.data = this.data.concat(oddNodes)

    console.log(this.data, "sorted data")
    var scale = d3.scaleOrdinal(d3["schemeSet3"]).domain(this.users.map((element) => element.name))

    this.graph.selectAll('.node').remove();
    this.graph.selectAll('.link').remove();


    // stratify the data

    this.data.sort((a, b) => {
      return a.id - b.id
    })
    console.log(this.data, "data before stratify")
    this.rootNode = d3.stratify()


      .id(function (d) {
        return d.id
      })
      .parentId(function (d) {
        return d.parent.id;
      })
      (this.data).sort((a, b) => a.id % 2 == 1 ? a.id - b.id : b.id - a.id)
    console.log(this.rootNode.descendants(), 'stratified data')
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
      .attr('fill', d => d.data.hasOwnProperty('owner') ? scale(d.data.owner) : 'gray')
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
    var colorLegend = d3.legendColor()
      //d3 symbol creates a path-string, for example
      //"M0,-8.059274488676564L9.306048591020996,
      //8.059274488676564 -9.306048591020996,8.059274488676564Z"
      .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
      .shapePadding(10)
      //use cellFilter to hide the "e" cell
      .cellFilter(function (d) { return d.label !== "e" })
      .scale(scale)
    this.graph.append("g")
      .attr("class", "userLegend")
    this.graph.select(".userLegend").call(colorLegend)
  }

  //fix the sorting of positive numbers

  // 

  ngOnInit() {
    // create a list of 63 nodes

    //put all these into a function
    // call function when there are not enough nodes to buy, calculating how many more nodes are needed
    var positiveNodes = []
    var negativeNodes = []
    negativeNodes.push({ id: 1, parent: "", children: [2,] })
    positiveNodes.push({ id: 2, position: "top", parent: negativeNodes[0], children: [] })
    //64
    for (let i = 3; i < 64; i++) {
      if (i % 2 == 0) {
        let parentNumber = i / 2 % 2 == 0 ? i / 2 : i / 2 - 1
        let parentIndex = positiveNodes.findIndex((element) => element.id == parentNumber)
        let parent = positiveNodes.find((element) => element.id == parentNumber)

        let node = { id: i, parent: parent, children: [], position: null }
        positiveNodes[parentIndex].children.length > 0 ? node.position = "top" : node.position = "bottom"

        positiveNodes.push(node)
        positiveNodes[parentIndex].children.push(i)
      }
      else {
        let parentNumber = Math.round(i / 2) % 2 != 0 ? Math.round(i / 2) : Math.round(i / 2) - 1
        let parentIndex = negativeNodes.findIndex((element) => element.id == parentNumber)
        let parent = negativeNodes.find((element) => element.id == parentNumber)
        let node = { id: i, parent: parent, children: [], position: null }
        negativeNodes[parentIndex].children.length > 0 ? node.position = "bottom" : node.position = "top"
        negativeNodes.push(node)
        negativeNodes[parentIndex].children.push(i)
      }
    }


    this.data = negativeNodes.concat(positiveNodes.reverse())

    console.log(this.data, "concated data")
    let mario = this

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

