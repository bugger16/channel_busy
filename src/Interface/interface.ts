export interface Root {
    log: Log
  }
  
  export interface Log {
    version: string
    creator: Creator
    pages: any[]
    entries: Entry[]
  }
  
  export interface Creator {
    name: string
    version: string
  }
  
  export interface Entry {
    _initiator: Initiator
    _priority: string
    _resourceType: string
    cache: Cache
    connection: string
    request: Request
    response: Response
    serverIPAddress: string
    startedDateTime: string
    time: number
    timings: Timings
  }
  
  export interface Initiator {
    type: string
    stack: Stack
  }
  
  export interface Stack {
    callFrames: CallFrame[]
  }
  
  export interface CallFrame {
    functionName: string
    scriptId: string
    url: string
    lineNumber: number
    columnNumber: number
  }
  
  export interface Cache {}
  
  export interface Request {
    method: string
    url: string
    httpVersion: string
    headers: Header[]
    queryString: QueryString[]
    cookies: Cooky[]
    headersSize: number
    bodySize: number
  }
  
  export interface Header {
    name: string
    value: string
  }
  
  export interface QueryString {
    name: string
    value: string
  }
  
  export interface Cooky {
    name: string
    value: string
    path: string
    domain: string
    expires: string
    httpOnly: boolean
    secure: boolean
  }
  
  export interface Response {
    status: number
    statusText: string
    httpVersion: string
    headers: Header2[]
    cookies: Cooky2[]
    content: Content
    redirectURL: string
    headersSize: number
    bodySize: number
    _transferSize: number
    _error: any
  }
  
  export interface Header2 {
    name: string
    value: string
  }
  
  export interface Cooky2 {
    name: string
    value: string
    path: string
    domain: string
    expires: any
    httpOnly: boolean
    secure: boolean
  }
  
  export interface Content {
    size: number
    mimeType: string
    compression: number
    text: string
  }
  
  export interface Timings {
    blocked: number
    dns: number
    ssl: number
    connect: number
    send: number
    wait: number
    receive: number
    _blocked_queueing: number
  }
  