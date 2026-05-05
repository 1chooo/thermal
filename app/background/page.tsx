import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BackgroundPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">積溫介紹 / Background</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Ported from the original “積溫介紹” section.
      </p>

      <Card className="mt-10 border-border/80 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">為什麼需要積溫？</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            在種植農作物的過程中，能得知作物的生長時間是非常重要的，能藉由作物的生長時長得知何時種植能
            在何時收成，更勝一步知道一年能收成多少次，推算出產量的大小。而種植時間要如何得知？這便是積
            溫的重要性了。
          </p>
          <p>
            <span className="font-medium text-foreground">積溫（Growing Degree Day）：</span>
            為作物從種下直到收成間的每日積熱總量，要在日積月累的受熱下才
            能累積到足夠的溫度使作物成熟。
          </p>
          <p>
            <span className="font-medium text-foreground">積熱：</span>
            為當日平均溫度減去基本溫度的量，為當日實際能讓植物生長的溫度量。
          </p>
          <p>
            <span className="font-medium text-foreground">基本溫度：</span>
            植物的生長起始溫度，當天的溫度一定要超過此值才能生長。
          </p>
          <p>
            <span className="font-medium text-foreground">MGDD：</span>
            為標準化的積溫，在大多數經濟作物可以有效增加生長速度的溫度區間，為 0～30℃ 的區間，
            當日最大溫度超過 30℃ 便以 30℃ 計算，最小溫度小於基本溫度便以基本溫度計算。本次的積溫計算便是用
            此方式。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
