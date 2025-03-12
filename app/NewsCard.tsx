import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getNews } from "@/app/actions/crypto-panic-action";
import { NewsResponse } from "@/lib/crypto-panic";

export async function NewsCard() {
  const response = await getNews();
  const news = response?.results;
  const hasMore = !!response?.next;
  const filteredNews = news;

  return (
    <Card className="w-full bg-background text-foreground">
      <CardHeader className="border-b border-background">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Latest News</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="divide-y divide-background/80">
            {news?.map((item) => (
              <article
                key={item.id}
                className="p-4 hover:bg-background/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-400">
                      <span>
                        {formatDistanceToNow(new Date(item.published_at))} ago
                      </span>
                      <span>•</span>
                      <span>{item.source.title}</span>
                      {item.currencies && item.currencies.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {item.currencies.map((currency) => (
                              <Badge
                                key={currency.code}
                                variant="secondary"
                                className="bg-background/70 text-foreground"
                              >
                                {currency.code}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <Link
                      href={item.url}
                      target="_blank"
                      className="text-base font-medium hover:text-blue-400 flex items-center gap-2 group"
                    >
                      {item.title}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-green-400 hover:bg-zinc-800 md:hidden"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {item.votes.positive}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-red-400 hover:bg-zinc-800 md:hidden"
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {item.votes.negative}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-blue-400 hover:bg-zinc-800"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {item.votes.comments}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 md:hidden"
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
