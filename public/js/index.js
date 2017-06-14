
function makeDonutChart(target, data){
  var svg = d3.selectAll("svg"),
      margin = {top: 20, right: 0, bottom: 30, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.1)
      .align(0.1);

  var y = d3.scaleLinear()
      .rangeRound([height, 0]);

  var z = d3.scaleOrdinal()
      .range(["#d0e9c6", "#faf2cc" ,"#ebcccc", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var stack = d3.stack()
      .offset(d3.stackOffsetExpand);

  x.domain(data.map(function(d) { return d.couName; }));
  z.domain(getColumns(data[0]).slice(1));

  var serie = g.selectAll(".serie")
    .data(stack.keys(getColumns(data[0]).slice(1))(data))
    .enter().append("g")
      .attr("class", "serie")
      .attr("fill", function(d) { return z(d.key); });

  serie.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x.bandwidth()/4 + x(d.data.couName); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth()/2);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .style("font", "16px sans-serif")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .style("font", "12px sans-serif")
      .call(d3.axisLeft(y).ticks(10, "%"));

  var legend = serie.append("g")
      .attr("class", "legend")
      .attr("transform", function(d) { var d = d[d.length - 1]; return "translate(" + (x(d.data.couName) + x.bandwidth()*3/4) + "," + ((y(d[0]) + y(d[1])) / 2) + ")"; });

  legend.append("line")
      .attr("x1", -6)
      .attr("x2", 6)
      .attr("stroke", "#000");

  legend.append("text")
      .attr("x", 9)
      .attr("dy", "0.35em")
      .attr("fill", "#000")
      .style("font", "16px sans-serif")
      .text(function(d) { return d.key; });

  function type(d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
  }

  function getColumns(json){
    var result = [];
    for (var key in json) {
      result.push(key);
    }
    return result;
  }
}
