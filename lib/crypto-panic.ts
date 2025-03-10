
export interface NewsSource {
    title: string
    region: string
    domain: string
    path: string | null
    type: string
  }
  
  export interface NewsVotes {
    negative: number
    positive: number
    important: number
    liked: number
    disliked: number
    lol: number
    toxic: number
    saved: number
    comments: number
  }
  
  export interface NewsCurrency {
    code: string
    title: string
    slug: string
    url: string
  }
  
  export interface NewsItem {
    kind: string
    domain: string
    source: NewsSource
    title: string
    published_at: string
    slug: string
    currencies?: NewsCurrency[]
    id: number
    url: string
    created_at: string
    votes: NewsVotes
  }
  
  export interface NewsResponse {
    count: number
    next: string | null
    previous: string | null
    results: NewsItem[]
  }
  
  