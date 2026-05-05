import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">專案導覽 / Guide</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Ported from the original project introduction panel.
      </p>

      <Card className="mt-10 border-border/80 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">方法與假設</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            在這個稻米的積溫計算器中，因為就目前所得的稻米基本溫度資料皆大約 10℃
            （台農67號：12.26℃，台中秈10號：7.07℃，台中109號：9.8℃），故以 10℃
            計算。而每日溫度選了近五年的資料進行平均，以增加未來的每日溫度的可預報度。
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/80 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">稻米生長期</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            稻米為我國最重要的農作物之一，為我們的一大主食，有許多種不同的品種，大多數時候為兩穫（兩次收成），
            分別為二～六月與七～十一月，十二月與一月為休耕的養地期，在播種後經過插秧（秧苗期，20～30
            天）、營養成長期（分蘗期，50 天）、升殖成長期（開花期，30 天）、成熟期（結穗期，40
            天）後，即可收割，第一穫因為初春到盛夏，成長期溫度偏低，故要花比較多時間；而第二穫從盛夏到秋末，
            在台灣能說是最熱的時段，故收成時間通常比第一穫短，而何時最短便要從積溫計算才能得知了。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
