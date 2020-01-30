import { Component, OnInit } from '@angular/core';
import { markParentViewsForCheck } from '@angular/core/src/view/util';
import { FormControl } from '@angular/forms';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { element } from '@angular/core/src/render3';
import { JsonPipe } from '@angular/common';
import { ɵangular_packages_platform_browser_dynamic_platform_browser_dynamic_a } from '@angular/platform-browser-dynamic';
declare const d3;
//declare const fisheye;
declare var graph;
declare var rootNode;
declare var userIndex;
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
  selected = 0;
  selectedInfo = null
  name = new FormControl('Bob')
  ammount = new FormControl('10')
  wholeTree = new FormControl(false)
  userIndex = null;
  users: any[] = []
  resetView() {
    this.selected = 0
    this.update()
  }
  addDataRow() {
    let dataLength = this.data.length;


    while (this.data.length < dataLength * 2 + 1) {
      let newItemId = this.data.length + 1
      if (newItemId % 2 == 0) {
        let parentNumber = newItemId / 2 % 2 == 0 ? newItemId / 2 : newItemId / 2 - 1
        let parentIndex = this.data.findIndex((element) => element.id == parentNumber)
        let parent = this.data.find((element) => element.id == parentNumber)

        let node = { id: newItemId, parent: parent, children: [], position: null, childrenSold: 0, sold: false }
        this.data[parentIndex].children.length > 0 ? node.position = "top" : node.position = "bottom"

        this.data.push(node)
        this.data[parentIndex].children.push(this.data[newItemId - 1])

      }
      else {
        let parentNumber = Math.round(newItemId / 2) % 2 != 0 ? Math.round(newItemId / 2) : Math.round(newItemId / 2) - 1
        let parentIndex = this.data.findIndex((element) => element.id == parentNumber)
        let parent = this.data.find((element) => element.id == parentNumber)

        let node = { id: newItemId, parent: parent, children: [], position: null, childrenSold: 0, sold: false }
        this.data[parentIndex].children.length > 0 ? node.position = "bottom" : node.position = "top"

        this.data.push(node)
        this.data[parentIndex].children.push(this.data[newItemId - 1])
      }
    }
  }
  findAllChildren(index) {
    let mario = this
    function produceIndexes(items) {

      let indexlist = []
      items.forEach((item) => {
        indexlist.push(
          mario.data.findIndex((node) => {
            return node.id == item.id
          }))
      })
      return indexlist
    }

    var childrenList = []
    var childstack = []

    childstack = produceIndexes(this.data[index].children)

    childrenList = childrenList.concat(this.data[index].children)


    while (childstack.length > 0) {

      var current = childstack.pop()
      if (this.data[current].children) {
        childstack = childstack.concat(produceIndexes(this.data[current].children))

        childrenList = childrenList.concat(this.data[current].children)
      }
    }
    childrenList = childrenList.sort((a, b) => a - b)
    return childrenList

  }
  nodesUntilPayout(a): number {
    var aValue = 0;

    try {
      var aUpper = a.children[0];
      var aValueUpper = aUpper.childrenSold > 32 ? 32 : aUpper.childrenSold
      aValueUpper += aUpper.hasOwnProperty("owner") ? 1 : 0;

      var aLover = a.children[1];
      var aValueLower = aLover.childrenSold > 32 ? 32 : aLover.childrenSold
      aValueLower += aLover.hasOwnProperty("owner") ? 1 : 0;

      aValue = aValueUpper + aValueLower
    }
    catch{
      //if it has no children
      aValue = 0
    }
    return 64 - aValue
  }
  findAllAncestors(index) {
    var ancestorsList = []
    ancestorsList.push(this.data[index])
    var item;
    try {
      item = this.data[index].parent
    }
    catch{
      item = undefined
    }

    while (typeof item != "undefined") {

      ancestorsList.push(item)

      try {
        item = this.data.find((node) => node.id == item.parent.id)
      }
      catch{

        item = undefined;
      }

    }

    ancestorsList = ancestorsList.filter((item) => item != '')

    ancestorsList.forEach((ancestor) => {
      ancestor.childrenSold += 1;
      ancestor.sold = !(this.nodesUntilPayout(ancestor) > 0)
      //check if ancestor is paid!

    })
  }
  //should work with a node list
  //findAllAncestors(index){} || add virtual index to sort
  findPaymentPriorityChild(nodes) {
    var sortedData = nodes.sort((a, b) => {
      var aNodes = this.nodesUntilPayout(a)
      var bNodes = this.nodesUntilPayout(b)
      var result = bNodes - aNodes
      // if values equal, sort by id
      if (result == 0) {
        return b.id - a.id
      }
      else {
        return result;
      }
    })
    return sortedData.reverse()
  }
  findChildrenWidthFirst(node) {
    var results = [[node]]
    let index = 0
    while (true) {
      var children = []
      results[index].forEach(element => {
        element.children.forEach(elementChild => {
          children.push(elementChild)
        });
      });
      if (children.length > 0) {
        results.push(children)
        index++
      }

      else {
        return results
      }
    }
  }
  makeTransaction(event) {
    // completely obsolete!

    function assignFreeNode(userIndex) {
      this.data.sort((a, b) => a.id - b.id)
      var assignedNode = null;
      var suggestedNode = this.data[0]
      while (assignedNode == null) {

        if (suggestedNode.childrenSold == 0) {
          assignedNode = suggestedNode
        }
        else {
          if (suggestedNode.children[0].childrenSold < suggestedNode.children[1].childrenSold) {
            suggestedNode = suggestedNode.children[0]
          }
          else { suggestedNode = suggestedNode.children[1] }
        }
      }

      this.users[userIndex].nodes.push(assignedNode)
      assignedNode.owner = this.name.value
      this.findAllAncestors(this.data.findIndex((item)=>item.id == assignedNode.id))
      return assignedNode

    }

    function createIndexedNodes(nodeIndex) {
      ammount = this.ammount.value
      //
      //nodeIndex = 11
      //pick a weaker child
      let freeChildren: any = []
      try {

        freeChildren = this.findAllChildren(nodeIndex)
      }
      catch{
        this.addDataRow()
        freeChildren = this.findAllChildren(nodeIndex)
      }



      //expand table so there are enough kids
      // add filter out sold kids
      while (freeChildren.length < ammount) {
        console.log("not enough rows... adding some")
        this.addDataRow()

        freeChildren = this.findAllChildren(nodeIndex)

      }
      //shallow copy of the data
      let virtualData = [...this.data].sort((a, b) => a.id - b.id)

      // asign one to the first node the user owns

      virtualData[nodeIndex].virtualId = 1

      // asign virtual indexes to virtual data
      for (let index = 0; index < freeChildren.length; index++) {
        var parent: any
        let originalElement = virtualData[index + 1]

        if (index > 1) {
          //same parent as original node
          parent = virtualData.find((parent) => {
            return parent.virtualId == originalElement.parent.id
              && parent.position == originalElement.parent.position
          })
        } else {
          parent = virtualData[nodeIndex]
        }
        this.data.sort((a, b) => a.id - b.id)
        let childElementIndex = virtualData.findIndex((item) => {
          return item.parent.id == parent.id
            //same position as original node
            && item.position == originalElement.position
        })
        //asign index
        virtualData[childElementIndex].virtualId = index + 2

      }

      // get indexed children to work with
      let indexedNodes = virtualData.filter((element) => element.hasOwnProperty("virtualId") && element.virtualId != null)
        .sort((a, b) => a.virtualId - b.virtualId)
      return indexedNodes
    }

    let outerThis = this
    this.data.sort((a, b) => a.id - b.id)
    let ammount = this.ammount.value
    // assigns virtual indexes, 

    //select element here and use as input
    //complete rewrite
    let name = this.name.value
    this.userIndex = this.users.findIndex((user) => user.name == name)
    //if user is new add user to the list
    if (this.userIndex < 0) {

      this.users.push({ name: name, nodes: [] })
      this.userIndex = this.users.length - 1

    }
    // claim nodes
    // data filtered by children
    // make that data the 



    if (this.users[this.userIndex].nodes.length == 0) {
      // fix this with a try catch block

      assignFreeNode.call(this, this.userIndex)

      ammount--
    }



    /////////////////////////expand table
    //this is the highest node owned by user
    // console.log(this.data)
    //console.log(this.users);




    console.log(this.findPaymentPriorityChild(this.users[this.userIndex].nodes), "payment priority list")
    var fakeList = this.findPaymentPriorityChild(this.users[this.userIndex].nodes).filter((node) => node.sold == false)

    var child1 = fakeList[0].children[0];
    var child2 = fakeList[0].children[1];
    var child1Value = this.nodesUntilPayout(child1)
    var child1Pay = 0 - child1Value;
    var child2Value = this.nodesUntilPayout(child2)
    var child2Pay = 0 - child2Value;
    var kidsToFeed = [{ node: child1, value: child1Value, pay: 0 }, { node: child2, value: child2Value, pay: 0 }]
    while (ammount > 0) {
      kidsToFeed.sort((a, b) => b.value - a.value)

      kidsToFeed[0].pay++
      kidsToFeed[0].value--
      ammount--
    }

    //var smallerChild = this.nodesUntilPayout(child1) > this.nodesUntilPayout(child2) ? child1 : child2;
    //while smallerchild is smaller
    pay.call(this, kidsToFeed[0].node, kidsToFeed[0].pay)
    pay.call(this, kidsToFeed[1].node, kidsToFeed[1].pay)
    //loop this twice
    function pay(node, ammount) {
      let nodeIndex = this.data.findIndex(

        // decide the node to pay out
        //instead of zero, the highest < 63 children sold node
        //sort data by highest children sold
        (element) => element.id == node.id
        //(element) => element.id == smallerChild.id
      )
      let indexedNodes = createIndexedNodes.call(this, nodeIndex).filter((node) => {
        return !node.hasOwnProperty("owner")
      })
      while (indexedNodes.length < this.ammount.value) {

        this.addDataRow()
        indexedNodes = createIndexedNodes.call(this).filter((node) => {
          return !node.hasOwnProperty("owner")
        })
      }

      // repeat everything above
      // filter out taken nodes, if less then ammount -> add another row -> repeat
      let index = 0
      while (ammount > 0 && index < indexedNodes.length) {
        let dataIndex = this.data.findIndex((element) => {
          return element.id == indexedNodes[index].id
        })

        let dataNode = this.data[dataIndex]

        // if node has no owner asign the new owner
        if (!dataNode.hasOwnProperty("owner")) {
          //add +1 sold nodes to all above
          this.data[dataIndex].owner = this.name.value;
          this.users[this.userIndex].nodes.push(dataNode);
          ammount -= 1;

          this.findAllAncestors(dataIndex)

        }
        index += 1;
      }

    }

    // if ammount still not zero, add a row and repeat the process

    this.update()
    this.data.forEach((item) => item.virtualId = null)

    /*
        this.data.sort((a, b) => {
          var aValue = 0;
          var bValue = 0;
          try {
            var aUpper = a.children[0];
            var aValueUpper = aUpper.childrenSold > 32 ? 32 : aUpper.childrenSold
            aValueUpper += aUpper.hasOwnProperty("owner") ? 1 : 0;
    
            var aLover = a.children[1];
            var aValueLower = aLover.childrenSold > 32 ? 32 : aLover.childrenSold
            aValueLower += aLover.hasOwnProperty("owner") ? 1 : 0;
    
            aValue = aValueUpper + aValueLower
          }
          catch{
            aValue = 0
          }
          try {
            var bUpper = b.children[0];
            var bValueUpper = bUpper.childrenSold > 32 ? 32 : bUpper.childrenSold
            bValueUpper += bUpper.hasOwnProperty("owner") ? 1 : 0;
    
            var bLover = b.children[1];
            var bValueLower = bLover.childrenSold > 32 ? 32 : bLover.childrenSold
            bValueLower += bLover.hasOwnProperty("owner") ? 1 : 0;
    
            bValue = bValueUpper + bValueLower
    
          }
          catch{
            bValue = 0;
          }
         
          return bValue - aValue
        }) */

  }
  update() {

    var scale = d3.scaleOrdinal(d3["schemeSet3"])
      .domain(this.users.map((element) => element.name))


    this.graph.selectAll('.node').remove();
    this.graph.selectAll('.link').remove();
    this.data.sort((a, b) => {
      return a.id - b.id
    })
    // could be skipped if selected = 0
    let children = ["skipped", this.data[this.selected], ...this.findAllChildren(this.selected)]

    //create a deep copy of the data array

    let strippedData = [...this.data]
      //wtf does this do?????
      .filter((element) => children.findIndex((child) => child.id == element.id) > 0 ? true : false)

    //splice the array so we get the same size tree

    strippedData.sort((a, b) => {
      return a.id - b.id
    })
    //display only portion of the tree
    if (this.wholeTree.value == false) {
      strippedData.splice(63)
    }
    // first item cant have a parent
    //dodge passing by reference value and messing up main data
    strippedData[0] = { owner: strippedData[0].owner, id: strippedData[0].id, parent: "", children: strippedData[0].children, childrenSold: strippedData[0].childrenSold, sold: strippedData[0].sold },

      //strippedData[0].parent = null;


      // stratify the data
      this.rootNode = d3.stratify()
        .id(function (d) {
          return d.id
        })
        .parentId(function (d) {
          return d.parent.id;
        })
        (strippedData).sort((a, b) => a.id % 2 == 1 ? a.id - b.id : b.id - a.id)

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
      .attr('stroke', d => d.target.data.hasOwnProperty('owner') ? scale(d.source.data.owner) : 'gray')////#aaa
      .attr('stroke-width', 2)

    // add a group for each node with the specified coordinates
    var enterNodes = this.nodes.enter().append('g')
      .attr('transform', (d, i, n) => {
        //rotates the tree
        let x = d.y
        let y = d.x
        return `translate(${x},${y})`
      })
      .attr('class', "node")

    // draw rectangles in each node group
    var rectangles = enterNodes.append('rect')
      .attr('fill', d => d.data.owner != null ? scale(d.data.owner) : 'gray')
      .attr('stroke', 'black')
      .attr('width', 30)//30
      .attr('height', 30)
      .attr('transform', d => `translate(${-5}, ${-10})`).raise();

    var infoBoxes = enterNodes.append('rect')
      .attr('fill', d => 'green')
      .attr('stroke', 'black')
      .attr('width', 150)//30
      .attr('height', 65)
      .attr('display', d => d.data.id == this.selectedInfo ? "block" : "none")
      .attr('transform', d => `translate(${-5}, ${-100})`)
    // add a click event on each rectangle

    enterNodes.append('text')
      .text((d) => {
        return `children sold: ${d.data.childrenSold} `
    
      })
      .attr('transform', d => `translate(${0}, ${-85})`)
      .attr('display', d => d.data.id == this.selectedInfo ? "block" : "none")

      enterNodes.append('text')
      .text((d) => {
        return `owner: ${d.data.owner}`
      })
      .attr('transform', d => `translate(${0}, ${-65})`)
      .attr('display', d => d.data.id == this.selectedInfo ? "block" : "none")

    enterNodes.on("mouseover", (d) => {
      console.log(d)

      this.selectedInfo = d.data.id;
      d3.select(this)
      d3.select(this)
      .style("stroke", "steelblue")

    })

    enterNodes.on("click", (d) => {
      console.log(d)

      this.selected = d.data.id - 1;
      this.update()
    })
    enterNodes.on("mouseleave", function(d) {
      console.log(d)

      this.selectedInfo = 0;
      d3.select(this)
      .stroke("steelblue")
    })



    // add text to each of the node groups
    enterNodes.append('text')
      .text((d) => { return d.data.id })
      .attr('fill', d => d.data.sold ? "red" : 'black')
      .attr('transform', d => `translate(${2}, ${10})`);

    var colorLegend = d3.legendColor()
      .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
      .shapePadding(10)
      //use cellFilter to hide the "e" cell
      .cellFilter(function (d) { return d.label !== "e" })
      .scale(scale)

    this.graph.append("g")
      .attr("class", "userLegend")
    this.graph.select(".userLegend").call(colorLegend)

    var fisheye = d3.fisheye.circular()
      .radius(150)
      .distortion(10);
    let mario = this
    if (this.wholeTree.value == true) {
      d3.select('.canvas').on("mousemove", function () {
        //have to invert mouse coords for some reason 
        let mouse = d3.mouse(this)
        let x = mouse[1]
        let y = mouse[0]
        fisheye.focus([x, y]);

        enterNodes.each(function (d) { d.fisheye = fisheye(d); })


          .attr('transform', d => `translate(${d.fisheye.y - 5}, ${d.fisheye.x - 10})`)
      });

    }

  }

  //fix the sorting of positive numbers

  // 

  ngOnInit() {
    this.data = [
      { id: 1, parent: "", children: [], childrenSold: 0, sold: false },
      { id: 2, position: "top", childrenSold: 0, parent: null, children: [], sold: false },
      { id: 3, position: "bottom", childrenSold: 0, parent: null, children: [], sold: false }]
    this.data[0].children = [this.data[1], this.data[2]]

    this.data[2].parent = this.data[0]
    this.data[1].parent = this.data[0]

    this.addDataRow()
    this.addDataRow()
    this.addDataRow()
    this.addDataRow()
    let random = this.findChildrenWidthFirst(this.data[1])




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
    this.wholeTree.valueChanges.subscribe(() => this.update())

  }


}

