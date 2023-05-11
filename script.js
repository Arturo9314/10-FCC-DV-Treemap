const dataURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'

const canvas  = d3.select('#canvas')
const tooltip = d3.select('#tooltip')
const legend = d3.select('#legend')
const drawCanvas = (height, width)=>{
    canvas.attr('width', width)
    canvas.attr('height', height)
}

const drawLegend = (categories, colorsCategories)=>{
    const legendWidth = legend.attr('width')
    const legendElemsPerRow = Math.floor(legendWidth/150);
    const legendElem = legend
        .append('g')
        .attr('transform', 'translate(60,' + 10 + ')')
        .selectAll('g')
        .data(categories)
        .enter()
        .append('g')
        .attr('transform', (d,i)=>{
            return (
                'translate(' +
                (i % legendElemsPerRow) * 150 +
                ',' +
                (Math.floor(i / legendElemsPerRow) * 15 +
                  10 * Math.floor(i / legendElemsPerRow)) +
                ')'
              );
        })
    legendElem.append('rect').attr('width', 15)
    .attr('height', 15).attr('class', 'legend-item')
    .attr('fill', (d,i)=>{
        const index = categories.indexOf(d)
        return colorsCategories[index]
    })
    legendElem.append('text').attr('x', 18).attr('y', 13)
        .text((d)=>{
            return d;
        })

}

const randomColor = ()=>{
    const red = Math.floor(Math.random()*56) + 200
    const green = Math.floor(Math.random()*56) + 200
    const blue = Math.floor(Math.random()*56)+ 200
    const colorHex = '#'+red.toString(16)+green.toString(16)+blue.toString(16)
    return colorHex
}
const drawTreeMap = (data, categories, colorsCategories)=>{
    const hierarchy = d3.hierarchy(data, (node)=>{
        return node['children']
    }).sum((node)=>{
        return node['value']
    }).sort((node1, node2)=>{
        return node2['value'] - node1['value']
    })
    let createTreeMap = d3.treemap().size([1000, 600]).paddingInner(1);
    createTreeMap(hierarchy)
    const dataTiles = hierarchy.leaves()
    const block = canvas.selectAll('g')
        .data(dataTiles)
        .enter()
        .append('g')
        .attr('transform', (dataElement) => {
            return 'translate(' + dataElement['x0'] + ', ' + dataElement['y0'] + ')'
        })
    block.append('rect')
        .attr('class','tile')
        .attr('fill', (dataElement)=>{
            const category = dataElement['data']['category']
            const index = categories.indexOf(category)
            if(index !== -1){
                return colorsCategories[index]
            }
        })
        .attr('data-name', (dataElement)=>{
            return dataElement['data']['name']
        }).attr('data-category',(dataElement)=>{
            return dataElement['data']['category']
        }).attr('data-value', (dataElement)=>{
            return dataElement['data']['value']
        }).attr('width', (dataElement) => {
            return dataElement['x1'] - dataElement['x0']
        })
        .attr('height', (dataElement) => {
            return dataElement['y1'] - dataElement['y0']
        })
        .on('mousemove', function(d, i) {
            const xposition = d.x-940
            const yposition = d.y-550
            tooltip.transition()
                .style('visibility', 'visible')
                .attr('data-value',i.value)
            tooltip.text(
                'Name: '+i.data.name+'\n'+'Category: '+i.data.category+'\n'+'Value: '+i.value
            )
            tooltip.style('translate', `${xposition}px ${yposition}px`);
        })
        .on('mouseout', function(d) {
            tooltip.transition()
                .style('visibility', 'hidden')
        })
    block.append('text')
        .text((movie) => {
            return movie['data']['name']
        })
        .attr('x', 5)
        .attr('y', 20)
            
}                       

const getData = async()=>{
    try {
        const response = await fetch(dataURL)
        const json = await response.json()
        const data = json
        return {data}
    } catch (error) {
        throw new Error(e)        
    }
}

const TreeMap = async()=>{
try {
    const {data} = await getData()
    const width = 1000
    const height = 600
    const categories = data.children.map((e)=>e.name) 
    const colorsCategories = categories.map((e)=>randomColor())
    drawCanvas(height, width)
    drawLegend(categories, colorsCategories)
    drawTreeMap(data, categories, colorsCategories)
} catch (error) {
    throw new Error(error)     
}
}

TreeMap()