import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

function setup(){
    const spaceX = new SpaceX();
    spaceX.launches().then(data=>{
        const listContainer = document.getElementById("listContainer")
        renderLaunches(data, listContainer);
    })
    spaceX.launchpads().then((data) => {
        drawMap(data.filter((launchpad => launchpad.launches.length > 0)));
    })
}

function renderLaunches(launches, container){
    const list = document.createElement("ul");
    launches.forEach(launch=>{
        const item = launchItem(launch)
        list.appendChild(item);
    })
    container.replaceChildren(list);
}

function launchItem(launch) {
    const item = document.createElement("li");
    item.innerHTML = launch.name;
    item.classList.add("launchItem")
    item.onmouseover = (event) => {
        const launchpadElement = document.getElementById(launch.launchpad)
        launchpadElement.classList.remove("launchpad")
        launchpadElement.classList.add("hightlightedLaunchpad")
    }
    item.onmouseleave = (event) => {
        const launchpadElement = document.getElementById(launch.launchpad)
        launchpadElement.classList.remove("hightlightedLaunchpad")
        launchpadElement.classList.add("launchpad")
    }

    return item
}

function drawMap(launchpads){
    const width = 1024 //640;
    const height = 720 //480;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};
    const svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    const projection = d3.geoMercator()
        .scale(100) //70
        .center([0,20])
        .translate([width / 2 - margin.left, height / 2]);

    const path = d3.geoPath().projection(projection)

    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", path)
        .attr("fill", function (d) {
            return colorScale(0);
        })
        .style("opacity", .7)
    
    const launchpadsGeodata = launchpads.map(launchpadToGeojson)

    svg.append("g")
        .attr("id", "launchpads")
        .selectAll("path")
        .data(launchpadsGeodata) 
        .enter()
        .append("path")
        .attr("d", path) 
        .attr("id", (d) => { return d.id })
        .attr("class", "launchpad")
}
function launchpadToGeojson(launchpad) {
    return { "type": "Feature", 
             "geometry": {"type": "Point", "coordinates": [launchpad.longitude, launchpad.latitude]},
             "properties": {"name": launchpad.name},
             "id": launchpad.id
           }
}
function colorScale(value) {
    return `rgb(${value},${value},${value})`
}
