// Vertex consists of an ID and data (normally stored in a Node object or similar)
const createVertex = (id, data) => ({ id: id, data: data });


const duplicateKeys = reductionFunc => obj => Object.keys(obj).reduce(reductionFunc, {});
const createAdjListFromVertices = duplicateKeys((acc, vertex) => ({ ...acc, [vertex]: [] }));
const createVerticesFromAdjList = duplicateKeys((acc, vertex) => ({ ...acc, [vertex]: {} }));

// e.g. graph: 1 -> 2 <-> 3
// {
//   adjList: {
//     id1: { id2 },
//     id2: { id3 },
//     id3: { id2 }
//   },
//   vertices: {
//     id1: {...},
//     id2: {...},
//     id3: {...}
//   }
// }
const createGraph = (adjList, vertices) => (
   adjList &&  vertices ? {
                            adjList: adjList,
                            vertices: vertices
                          } :
  !adjList &&  vertices ? {
                            adjList: createAdjListFromVertices(vertices),
                            vertices: vertices
                          } :
   adjList && !vertices ? {
                            adjList: adjList,
                            vertices: createVerticesFromAdjList(adjList)
                          } :
                          { adjList: {}, vertices: {} });


const deepCopy = obj => JSON.parse(JSON.stringify(obj));

// As these are objects containing nested objects, perform deep copy
const getAdjList = graph => deepCopy(graph.adjList);
const getVertices = graph => deepCopy(graph.vertices);

// Check using the vertices, not the adjacency list because in a directed graph
// you can have a vertex that does not point towards any other vertices
// e.g. A -> B
// B's adjacency list will be empty
// Should it be possible that a vertex exists in the vertices object, but not be present in the adjacency list object??
const getIds = graph => Object.keys(getVertices(graph));

const addVertex = (graph, id, data) => {
  const newAdjList = { ...getAdjList(graph), [id]: {} };
  const newVertices = { ...getVertices(graph), [id]: data };

  return createGraph(newAdjList, newVertices);
};

const vertexExists = (graph, id) => graph.adjList.hasOwnProperty(id) && graph.vertices.hasOwnProperty(id);

// 'data' can be an object or a primitive
const addConnectionInAdjList = (adjList, id1, id2, data={}) => ({ ...adjList, [id1]: {...adjList[id1], [id2]: data} });

const addEdgeGeneric = directed => (graph, id1, id2, data) => {
  if (!vertexExists(graph, id1) || !vertexExists(graph, id2))
    return graph;

  const adjList = getAdjList(graph);
  const vertices = getVertices(graph);

  const tempAdjList = !Object.keys(adjList[id1])
                             .find(v => v === id2) ? addConnectionInAdjList(adjList, id1, id2, data)
                                                   : adjList;
  const newAdjList = !directed && !Object.keys(tempAdjList[id2])
                                         .find(v => v === id1) ? addConnectionInAdjList(tempAdjList, id2, id1, data)
                                                               : tempAdjList;

  return createGraph(newAdjList, vertices);
};

const addEdge = addEdgeGeneric(false);
const addDirectedEdge = addEdgeGeneric(true);

// RFC4122 version 4 compliant solution
// https://stackoverflow.com/a/2117523/9847165
const generateUuid = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
};


// Example usages:


// ('node' is simply a container for a potentially complex object being stored in each vertex)
const createNode = (name, capital, area) => ({ name: name, capital: capital, area: area });

const vertices = {
  'ACT': createNode('Australian Capital Territory', 'Canberra',     2280),
  'NSW': createNode('New South Wales',              'Sydney',     800628),
  'NT':  createNode('Northern Territory',           'Darwin',    1335742),
  'QLD': createNode('Queensland',                   'Brisbane',  1723936),
  'SA':  createNode('South Australia',              'Adelaide',   978810),
  'TAS': createNode('Tasmania',                     'Hobart',      64519),
  'VIC': createNode('Victoria',                     'Melbourne',  227010),
  'WA':  createNode('Western Australia',            'Perth',     2526786)
};

const adjList = {
  'ACT': { 'NSW':  286 },
  'NSW': { 'ACT':  286, 'VIC':  878,  'SA':  1375, 'QLD': 914 },
  'NT':  { 'QLD': 3428, 'SA':  3032,  'WA':  4030 },
  'QLD': { 'NSW':  914, 'SA':  2022,  'NT':  3428 },
  'SA':  { 'VIC':  727, 'NSW': 1375,  'QLD': 2022, 'NT': 3032, 'WA': 2697 },
  'TAS': { },
  'VIC': { 'NSW':  878, 'SA':   727 },
  'WA':  { 'SA':  2697, 'NT':  4030 }
};

const graph = createGraph(adjList, vertices);

console.log('graph: ', graph);


// An imperative approach to creating a graph
let imperativeGraph = createGraph();
imperativeGraph = addVertex(imperativeGraph, 'ACT', createNode('Australian Capital Territory', 'Canberra',     2280));
imperativeGraph = addVertex(imperativeGraph, 'NSW', createNode('New South Wales',              'Sydney',     800628));
imperativeGraph = addVertex(imperativeGraph, 'NT',  createNode('Northern Territory',           'Darwin',    1335742));
imperativeGraph = addVertex(imperativeGraph, 'QLD', createNode('Queensland',                   'Brisbane',  1723936));
imperativeGraph = addVertex(imperativeGraph, 'SA',  createNode('South Australia',              'Adelaide',   978810));
imperativeGraph = addVertex(imperativeGraph, 'TAS', createNode('Tasmania',                     'Hobart',      64519));
imperativeGraph = addVertex(imperativeGraph, 'VIC', createNode('Victoria',                     'Melbourne',  227010));
imperativeGraph = addVertex(imperativeGraph, 'WA',  createNode('Western Australia',            'Perth',     2526786));
// Passing in an object as data here - could just be a primitive number type as seen in previous example
imperativeGraph = addEdge(imperativeGraph, 'ACT', 'NSW', {distance:  286});
imperativeGraph = addEdge(imperativeGraph, 'VIC', 'NSW', {distance:  878});
imperativeGraph = addEdge(imperativeGraph, 'VIC', 'SA',  {distance:  727});
imperativeGraph = addEdge(imperativeGraph, 'NSW', 'SA',  {distance: 1375});
imperativeGraph = addEdge(imperativeGraph, 'QLD', 'NSW', {distance:  914});
imperativeGraph = addEdge(imperativeGraph, 'QLD', 'SA',  {distance: 2022});
imperativeGraph = addEdge(imperativeGraph, 'QLD', 'NT',  {distance: 3428});
imperativeGraph = addEdge(imperativeGraph, 'SA',  'NT',  {distance: 3032});
imperativeGraph = addEdge(imperativeGraph, 'SA',  'WA',  {distance: 2697});
imperativeGraph = addEdge(imperativeGraph, 'NT',  'WA',  {distance: 4030});


console.log('imperative graph: ', imperativeGraph);
console.log('\tIDs: ', getIds(imperativeGraph));
console.log('\tAdjList: ', getAdjList(imperativeGraph));


// In the case of an undirected graph, the adjacency list contains duplicate data
// TODO - devise an efficient way to store this information
