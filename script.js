// D3 BAR CHART
// set the dimensions and margins of the graph
var barOuterWidth = 860;
var margin = {top: 0, right: 30, bottom: 50, left: 180};
  width = barOuterWidth - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#barchart")
  .append("svg")
    .attr("width", barOuterWidth)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", "0 0 " + barOuterWidth + " " + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("Data/GlobalGDPComparison_2023.csv").then(function(data) {

  console.log("Bar chart data loaded", data.length);

  // Convert GDP to number
  data.forEach(function(d) {
    d.GDP_Nominal_USD_Trillion = +d.GDP_Nominal_USD_Trillion;
    d.Entity = d.Entity.trim();
  });

  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 28])
    .range([ 0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0).tickValues([0, 4, 8, 12, 16, 20, 24, 28]))
    .select(".domain").remove();

  svg.select("g:last-of-type")
    .selectAll("text")
      .attr("transform", null)
      .style("text-anchor", "middle");

  // X axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .style("text-anchor", "middle")
    .text("Trillions of dollars");

  // Y axis
  var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(data.map(function(d) { return d.Entity; }))
    .padding(.1);
  svg.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove();

  //Bars
  var bars = svg.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(d.Entity); })
    .attr("width", 0)
    .attr("height", y.bandwidth() )
    .attr("fill", function(d) { return d.Entity === "U.S. LATINO GDP" ? "red" : "#7bbafd"; });

  function animateBars() {
    bars
      .interrupt()
      .transition()
      .duration(1100)
      .delay(function(d, i) { return i * 140; })
      .ease(d3.easeCubicOut)
      .attr("width", function(d) { return x(d.GDP_Nominal_USD_Trillion); });
  }

  var barChartContainer = document.querySelector("#barchart");
  if (barChartContainer && "IntersectionObserver" in window) {
    var hasAnimatedBars = false;
    var barObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!hasAnimatedBars && entry.isIntersecting) {
          hasAnimatedBars = true;
          animateBars();
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    barObserver.observe(barChartContainer);
  } else {
    animateBars();
  }


    // .attr("x", function(d) { return x(d.Country); })
    // .attr("y", function(d) { return y(d.Value); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.Value); })
    // .attr("fill", "#2b83a8")

})
// ==========================
// LINE CHART - YEARLY TOTAL WORKERS
// ==========================

// set dimensions
var margin2 = {top: 30, right: 30, bottom: 50, left: 90},
    width2 = 700 - margin2.left - margin2.right,
    height2 = 400 - margin2.top - margin2.bottom;

// create second svg
var svg2 = d3.select("#line_chart")
  .append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .attr("viewBox", "0 0 " + (width2 + margin2.left + margin2.right) + " " + (height2 + margin2.top + margin2.bottom))
    .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
    .attr("transform",
          "translate(" + margin2.left + "," + margin2.top + ")");


// ==========================
// TOOLTIP
// ==========================
var tooltip = d3.select("body")
  .append("div")
  .attr("class", "chart-tooltip")
  .style("position", "absolute")
  .style("background", "white")
  .style("color", "#111")
  .style("padding", "8px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
  .style("font-size", "12px")
  .style("line-height", "1.35")
  .style("z-index", "9999")
  .style("opacity", 0)
  .style("pointer-events", "none");


// ==========================
// LOAD DATA
// ==========================
d3.csv("Data/participation_rate.csv").then(function(data) {
  var rateKey = Object.keys(data[0] || {}).find(function(k) {
    return k.trim() === "participation_rate";
  });
  
  // Clean and prepare data
  data.forEach(function(d) {
    d.year = +d.Date;
    d.total = +d.total.replace(/,/g, "");

    var rawRate = rateKey ? d[rateKey] : null;
    d.rate = rawRate != null ? +String(rawRate).replace(/%/g, "") : NaN;
    if (d.rate <= 1) d.rate = d.rate * 100;
  });

  // Sort by year
  data.sort((a, b) => a.year - b.year);

  // ==========================
  // X SCALE
  // ==========================
  var x = d3.scaleLinear()
    .domain([2015.5, 2025.5])
    .range([0, width2]);

  svg2.append("g")
    .attr("transform", "translate(0," + height2 + ")")
    .call(d3.axisBottom(x)
      .tickValues([2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025])
      .tickSize(0)
      .tickFormat(d3.format("d"))
    )
    .select(".domain").remove();


  // ==========================
  // Y SCALE
  // ==========================
  var y = d3.scaleLinear()
    .domain([24000000, 33000000])
    .range([height2, 0]);

  svg2.append("g")
    .call(
      d3.axisLeft(y)
        .tickSize(0)
        .tickFormat(d => (d/1000000).toFixed(0) + 'M')
    )
    .select(".domain").remove();


  // ==========================
  // AXIS LABELS
  // ==========================
  svg2.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -70)
    .attr("x", -height2 / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Total Workers (millions)");

  svg2.append("text")
    .attr("x", width2 / 2)
    .attr("y", height2 + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Year");


  // ==========================
  // DRAW LINE
  // ==========================
  var line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.total));
    
  svg2.append("path")
    .attr("class", "workers-line")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#e63946")
    .attr("stroke-width", 3)
    .attr("d", line);


  // ==========================
  // ADD POINTS WITH TOOLTIPS
  // ==========================
  svg2.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "workers-point")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.total))
    .attr("r", 6)
    .attr("fill", "#f65361")
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .attr("cursor", "pointer")
    .on("mouseover", function(event, d){
      d3.select(this).attr("r", 8);
      var rateValue = Number.isFinite(d.rate) ? d.rate.toFixed(1) + "%" : "N/A";
      
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d.year}</strong><br>
           Total Workers: ${d3.format(",")(d.total)}<br>
           Participation Rate: ${rateValue}`
        )
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 40) + "px");
    })
    .on("mouseout", function(){
      d3.select(this).attr("r", 6);
      tooltip.style("opacity", 0);
    });

  // Title
  function animateLineChart() {
    var path = svg2.select(".workers-line");
    var points = svg2.selectAll(".workers-point");
    var totalLength = path.node().getTotalLength();

    path
      .interrupt()
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1400)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);

    points
      .interrupt()
      .attr("opacity", 0)
      .attr("r", 0)
      .transition()
      .delay(function(d, i) { return 700 + (i * 90); })
      .duration(350)
      .attr("opacity", 1)
      .attr("r", 6);
  }

  var lineChartContainer = document.querySelector("#line_chart");
  if (lineChartContainer && "IntersectionObserver" in window) {
    var hasAnimatedLineChart = false;
    var lineObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!hasAnimatedLineChart && entry.isIntersecting) {
          hasAnimatedLineChart = true;
          animateLineChart();
          lineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    lineObserver.observe(lineChartContainer);
  } else {
    animateLineChart();
  }

}).catch(function(error) {
  console.error("Error loading data:", error);
  svg2.append("text")
    .attr("x", width2/2)
    .attr("y", height2/2)
    .attr("text-anchor", "middle")
    .attr("fill", "red")
    .text("Error loading data. Check file path.");
});

// D3 Mosaic Chart

// set the dimensions and margins of the graph
var margin3 = {top: 10, right: 10, bottom: 10, left: 10},
  width3 = 445 - margin3.left - margin3.right,
  height3 = 445 - margin3.top - margin3.bottom;

// append the svg object to the body of the page
var svg3 = d3.select("#mosaic_chart")
.append("svg")
  .attr("width", width3 + margin3.left + margin3.right)
  .attr("height", height3 + margin3.top + margin3.bottom)
  .attr("viewBox", "0 0 " + (width3 + margin3.left + margin3.right) + " " + (height3 + margin3.top + margin3.bottom))
  .attr("preserveAspectRatio", "xMidYMid meet")
.append("g")
  .attr("transform",
        "translate(" + margin3.left + "," + margin3.top + ")");

// Read data
d3.csv("Data/LatinoEconomicData_2023.csv").then(function(data) {

  function formatMoneyFromTrillions(valueTrillions) {
    if (!Number.isFinite(valueTrillions)) return "";
    if (valueTrillions >= 1) return "$" + valueTrillions.toFixed(1) + "T";
    return "$" + (valueTrillions * 1000).toFixed(0) + "B";
  }

  // Convert numeric values and normalize labels
  data.forEach(function(d) {
    d.label = (d.label || "").trim();
    d.value_trillions = +d.value_trillions;
  });

  // Build hierarchy from flat rows in the CSV
  var hierarchyData = {
    label: "Total Gross Income",
    children: data
      .filter(function(d) {
        return d.label !== "Total Gross Income" && Number.isFinite(d.value_trillions);
      })
      .map(function(d) {
        return {
          label: d.label,
          value_trillions: d.value_trillions,
          percentage: +d.percentage
        };
      })
  };

  var root = d3.hierarchy(hierarchyData)
    .sum(function(d) { return d.value_trillions || 0; });

  // Then d3.treemap computes the position of each element of the hierarchy
  // The coordinates are added to the root object above
  d3.treemap()
    .size([width3, height3])
    .padding(4)
    (root)

console.log(root.leaves())
  // use this information to add rectangles:
  var color = d3.scaleOrdinal()
    .domain(root.leaves().map(function(d) { return d.data.label; }))
    .range(["rgb(240, 174, 67)", "#0a0d2d", "#7bbafd", "#9467bd", "#8c564b"]);

  svg3
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', 0)
      .style("stroke", "black")
      .style("fill", function(d) { return color(d.data.label); })
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).style("opacity", 0.85);
        tooltip
          .style("opacity", 1)
          .html(
            "<strong>" + d.data.label + "</strong><br>" +
            "Amount: " + formatMoneyFromTrillions(d.data.value_trillions) + "<br>" +
            "Share: " + d.data.percentage + "%"
          )
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 1);
        tooltip.style("opacity", 0);
      });

  var mosaicRects = svg3.selectAll("rect");

  // Add wrapped labels (hide on very small tiles to avoid overlap)
  var labelPadding = 6;
  var lineHeight = 14;

  svg3
    .selectAll(".mosaic-label")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("class", "mosaic-label")
      .attr("x", function(d){ return d.x0 + labelPadding; })
      .attr("y", function(d){ return d.y0 + labelPadding + 10; })
      .attr("font-size", "12px")
      .attr("fill", "white")
      .style("opacity", 0)
      .each(function(d) {
        var textSel = d3.select(this);
        var boxWidth = (d.x1 - d.x0) - (labelPadding * 2);
        var boxHeight = (d.y1 - d.y0) - (labelPadding * 2);

        // Skip labels that cannot fit readable text
        if (boxWidth < 70 || boxHeight < 24) {
          textSel.remove();
          return;
        }

        var maxCharsPerLine = Math.max(10, Math.floor(boxWidth / 6.3));
        var maxLines = Math.max(1, Math.floor(boxHeight / lineHeight));
        var words = d.data.label.split(/\s+/);
        var lines = [];
        var currentLine = "";

        words.forEach(function(word) {
          var testLine = currentLine ? currentLine + " " + word : word;
          if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine);

        lines.slice(0, maxLines).forEach(function(line, i) {
          textSel.append("tspan")
            .attr("x", d.x0 + labelPadding)
            .attr("dy", i === 0 ? 0 : lineHeight)
            .text(line);
        });

        if (maxLines > lines.length && boxHeight >= (lineHeight * 2)) {
          textSel.append("tspan")
            .attr("x", d.x0 + labelPadding)
            .attr("dy", lineHeight * 1.8)
            .attr("font-weight", "bold")
            .attr("font-size", "20pt")
            .text(formatMoneyFromTrillions(d.data.value_trillions));
        }
      });

  var mosaicTexts = svg3.selectAll(".mosaic-label");

  function animateMosaic() {
    mosaicRects
      .interrupt()
      .attr('height', 0)
      .attr('y', function (d) { return d.y1; })
      .transition()
      .duration(900)
      .delay(function(d, i) { return i * 120; })
      .ease(d3.easeCubicOut)
      .attr('y', function (d) { return d.y0; })
      .attr('height', function (d) { return d.y1 - d.y0; });

    mosaicTexts
      .interrupt()
      .transition()
      .delay(function(d, i) { return 250 + (i * 120); })
      .duration(500)
      .style("opacity", 1);
  }

  var mosaicChartContainer = document.querySelector("#mosaic_chart");
  if (mosaicChartContainer && "IntersectionObserver" in window) {
    var hasAnimatedMosaic = false;
    var mosaicObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!hasAnimatedMosaic && entry.isIntersecting) {
          hasAnimatedMosaic = true;
          animateMosaic();
          mosaicObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    mosaicObserver.observe(mosaicChartContainer);
  } else {
    animateMosaic();
  }

}).catch(function(error) {
  console.error("Error loading data:", error);
  svg3.append("text")
    .attr("x", width3/2)
    .attr("y", height3/2)
    .attr("text-anchor", "middle")
    .attr("fill", "red")
    .text("Error loading data. Check file path.");
});

// ==========================
// FIRST SECTION SVG REVEAL ANIMATION
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  var firstSectionSvgs = Array.from(document.querySelectorAll(".first-section-svg"));
  if (!firstSectionSvgs.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    firstSectionSvgs.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var firstSectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        firstSectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  firstSectionSvgs.forEach(function (el) {
    firstSectionObserver.observe(el);
  });
});

// ==========================
// SCROLLAMA - HIGHLIGHT BOX ANIMATION
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  if (typeof scrollama !== "function") {
    return;
  }

  var steps = Array.from(document.querySelectorAll(".scrolly-highlight-step"));
  if (!steps.length) {
    return;
  }

  var scroller = scrollama();

  scroller
    .setup({
      step: ".scrolly-highlight-step",
      offset: 0.72,
      progress: false,
      debug: false
    })
    .onStepEnter(function (response) {
      response.element.classList.add("is-active");
    })
    .onStepExit(function (response) {
      if (response.direction === "up") {
        response.element.classList.remove("is-active");
      }
    });

  window.addEventListener("resize", function () {
    scroller.resize();
  });
});
