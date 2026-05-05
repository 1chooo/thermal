import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">關於我們 / About</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Credits from the original Tkinter “About us” panel; this web port was rebuilt with Next.js and shadcn/ui.
      </p>

      <Card className="mt-10 border-border/80 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">專案角色（原版）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>Data pre-solving: 孫維辰（資料尋搜者）</p>
          <p>Numerical Method: 洪晨哲（接水大掌門）</p>
          <p>GUI and Data Scratch: 林群賀（排水大將軍）</p>
        </CardContent>
      </Card>
    </div>
  );
}
