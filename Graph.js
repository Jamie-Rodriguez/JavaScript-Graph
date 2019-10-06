// Vertex consists of an ID and data (normally stored in a Node object or similar)
const createVertex = (id, data) => ({ id: id, data: data });


const duplicateKeys = reductionFunc => obj => Object.keys(obj).reduce(reductionFunc, {});
const createAdjListFromVertices = duplicateKeys((acc, vertex) => ({ ...acc, [vertex]: [] }));
const createVerticesFromAdjList = duplicateKeys((acc, vertex) => ({ ...acc, [vertex]: {} }));

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

const addVertex = (graph, id, data) => {
  const newAdjList = { ...getAdjList(graph), [id]: [] };
  const newVertices = { ...getVertices(graph), [id]: data };

  return createGraph(newAdjList, newVertices);
};

const vertexExists = (graph, id) => graph.adjList.hasOwnProperty(id) && graph.vertices.hasOwnProperty(id);

const addConnectionInAdjList = (adjList, id1, id2) => ({ ...adjList, id1: [...adjList[id1], id2] });

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


// Example usages:

// Node is simply a container for a potentially complex object being stored in each vertex
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
  'ACT': [ 'NSW' ],
  'NSW': [ 'ACT', 'VIC', 'SA', 'QLD' ],
  'NT':  [ 'QLD', 'SA',  'WA' ],
  'QLD': [ 'NSW', 'SA',  'NT' ],
  'SA':  [ 'VIC', 'NSW', 'QLD', 'NT', 'WA' ],
  'TAS': [ ],
  'VIC': [ 'NSW', 'SA' ],
  'WA':  [ 'SA',  'NT' ]
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

imperativeGraph = addEdge(imperativeGraph, 'ACT', 'NSW');
imperativeGraph = addEdge(imperativeGraph, 'VIC', 'NSW');
imperativeGraph = addEdge(imperativeGraph, 'VIC', 'SA');
imperativeGraph = addEdge(imperativeGraph, 'NSW', 'SA');
imperativeGraph = addEdge(imperativeGraph, 'QLD', 'NSW');
imperativeGraph = addEdge(imperativeGraph, 'QLD', 'SA');
imperativeGraph = addEdge(imperativeGraph, 'QLD', 'NT');
imperativeGraph = addEdge(imperativeGraph, 'SA',  'NT');
imperativeGraph = addEdge(imperativeGraph, 'SA',  'WA');
imperativeGraph = addEdge(imperativeGraph, 'NT',  'WA');

console.log('imperative graph: ', imperativeGraph);
console.log('\tIDs: ', getIds(imperativeGraph));
console.log('\tAdjList: ', getAdjList(imperativeGraph));
