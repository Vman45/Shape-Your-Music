import gql from 'graphql-tag';
export const typeDefs = gql`
  directive @embedded on OBJECT
  directive @collection(name: String!) on OBJECT
  directive @index(name: String!) on FIELD_DEFINITION
  directive @resolver(
    name: String
    paginated: Boolean! = false
  ) on FIELD_DEFINITION
  directive @relation(name: String) on FIELD_DEFINITION
  directive @unique(index: String) on FIELD_DEFINITION
  scalar Date

  scalar Long

  type Mutation {
    updateProject(id: ID!, data: ProjectInput!): Project
    createShape(data: ShapeInput!): Shape!
    deleteShape(id: ID!): Shape
    deleteProject(id: ID!): Project
    createProject(data: ProjectInput!): Project!
    updateShape(id: ID!, data: ShapeInput!): Shape
  }

  type Project {
    name: String!
    tempo: Int!
    scale: String!
    _id: ID!
    isSnapToGridActive: Boolean!
    isAutoQuantizeActive: Boolean!
    tonic: String!
    isGridActive: Boolean!
    userId: String!
    shapesList(_size: Int, _cursor: String): ShapePage!
    userName: String!
    _ts: Long!
  }

  input ProjectInput {
    name: String!
    tempo: Int!
    tonic: String!
    scale: String!
    isGridActive: Boolean!
    isSnapToGridActive: Boolean!
    isAutoQuantizeActive: Boolean!
    shapesList: ProjectShapesListRelation
    userId: String!
    userName: String!
  }

  type ProjectPage {
    data: [Project]!
    after: String
    before: String
  }

  input ProjectShapesListRelation {
    create: [ShapeInput]
    connect: [ID]
    disconnect: [ID]
  }

  type Query {
    findProjectByID(id: ID!): Project
    findShapeByID(id: ID!): Shape
    allProjects(_size: Int, _cursor: String): ProjectPage!
  }

  type Shape {
    project: Project
    _id: ID!
    isMuted: Boolean
    points: [Int!]
    colorIndex: Int!
    volume: Int!
    _ts: Long!
  }

  input ShapeInput {
    points: [Int!]
    colorIndex: Int!
    volume: Int!
    isMuted: Boolean
    project: ShapeProjectRelation
  }

  type ShapePage {
    data: [Shape]!
    after: String
    before: String
  }

  input ShapeProjectRelation {
    create: ProjectInput
    connect: ID
    disconnect: Boolean
  }

  scalar Time
`;
