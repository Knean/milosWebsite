import { Component, OnInit } from '@angular/core';
import { markParentViewsForCheck } from '@angular/core/src/view/util';
declare const d3;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'milosWebsite';

  ngOnInit() {
    var data = [
      { name: "mario", parent: "knean" },
      { name: "knean" },
      { name: "gay", parent: "knean" },
      {name: "fag",parent:"knean"}
    ]
    const dims = { height: 500, width: 1100 };

    const svg = d3.select('.canvas')
      .append('svg')
      .attr('width', dims.width + 100)
      .attr('height', dims.height + 100);

    const graph = svg.append('g')
      .attr('transform', 'translate(50, 50)');
    var rootNode = d3.stratify()

      .id(function (d) {
        return d.name
      })
      .parentId(function (d) {
        return d.parent;
      })
      (data)
    var treeData = d3.tree().size([800,400])(rootNode)
    console.log()
    const nodes = graph.selectAll('.node')
      .data(treeData.descendants())

    var enterNodes = nodes.enter()
    .append('rect')
    .attr('fill', 'red')
    .attr('stroke','black')
    .attr('width', 100)
    .attr('height',100)
    .attr('transform',(d,i,n)=>{
      let x = d.x
      let y = d.y
      return `translate(${x},${y})`
    })


  }
}

var draw = function () {

}
draw();