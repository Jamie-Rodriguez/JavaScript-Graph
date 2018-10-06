// Vertex is an ID and data (normally stored in a Node object or similar)
const createVertex = (id, properties) => ({ id: id, properties: properties });

const duplicateKeys = reductionFunc => obj => Object.keys(obj).reduce(reductionFunc, {});
const createAdjListFromVertices = duplicateKeys((acc, key) => ({ ...acc, [key]: [] }));
const createVerticesFromAdjList = duplicateKeys((acc, key) => ({ ...acc, [key]: {} }));
// At time of writing, spread properties is a Stage 4 proposal for ECMAScript 2018.
// Workaround if not yet supported is below:
// const createAdjListFromVertices = duplicateKeys((o, key) => Object.assign(o, { [key]: [] }));
// const createVerticesFromAdjList = duplicateKeys((o, key) => Object.assign(o, { [key]: {} }));


// e.g. graph: 1 -> 2 <-> 3
// {
//   adjList: {
//     id1: [ id2 ],
//     id2: [ id3 ],
//     id3: [ id2 ]
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

const addVertex = (graph, id, properties) => {
  const newAdjList = Object.assign({}, getAdjList(graph), {[id]: []});
  const newVertices = Object.assign({}, getVertices(graph), {[id]: properties});
  
  return createGraph(newAdjList, newVertices);
};

const vertexExists = (graph, id) => graph.adjList.hasOwnProperty(id) && graph.vertices.hasOwnProperty(id);

const addConnectionInAdjList = (adjList, id1, id2) => Object.assign({}, adjList, { [id1]: adjList[id1].concat([id2]) });

const addEdgeGeneric = directed => (graph, id1, id2) => {
  if (!vertexExists(graph, id1) || !vertexExists(graph, id2))
    return graph;

  const adjList = getAdjList(graph);
  const vertices = getVertices(graph);

  const tempAdjList = !adjList[id1].find(v => v === id2) ? addConnectionInAdjList(adjList, id1, id2) : adjList;
  const newAdjList = !directed && !tempAdjList[id2].find(v => v === id1) ? addConnectionInAdjList(tempAdjList, id2, id1) : tempAdjList;
    
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


// Example usage
// Node is simply a container for a potentially complex object being stored in each vertex
const createNode = (name, capital, area) => ({ name: name, capital: capital, area: area });

let g = createGraph();
g = addVertex(g, "ACT", createNode("Australian Capital Territory", "Canberra",     2280));
g = addVertex(g, "NSW", createNode("New South Wales",              "Sydney",     800628));
g = addVertex(g, "NT",  createNode("Northern Territory",           "Darwin",    1335742));
g = addVertex(g, "QLD", createNode("Queensland",                   "Brisbane",  1723936));
g = addVertex(g, "SA",  createNode("South Australia",              "Adelaide",   978810));
g = addVertex(g, "TAS", createNode("Tasmania",                     "Hobart",      64519));
g = addVertex(g, "VIC", createNode("Victoria",                     "Melbourne",  227010));
g = addVertex(g, "WA",  createNode("Western Australia",            "Perth",     2526786));

g = addEdge(g, "ACT", "NSW");
g = addEdge(g, "VIC", "NSW");
g = addEdge(g, "VIC", "SA");
g = addEdge(g, "NSW", "SA");
g = addEdge(g, "QLD", "NSW");
g = addEdge(g, "QLD", "SA");
g = addEdge(g, "QLD", "NT");
g = addEdge(g, "SA",  "NT");
g = addEdge(g, "SA",  "WA");
g = addEdge(g, "NT",  "WA");

console.log("g: ", g);
console.log("IDs: ", getIds(g));
console.log("AdjList: ", getAdjList(g));

