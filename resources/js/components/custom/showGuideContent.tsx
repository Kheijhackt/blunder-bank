import {
    BrainCircuit,
    BookOpen,
    Target,
    PenTool,
    Lightbulb,
    Trophy,
    Link as LinkIcon,
    XCircle,
    CheckCircle2,
    Search,
    Database,
    Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Icons

export default function ShowGuideContent() {
    return (
        <div className="space-y-8 p-5">
            {/* Hero Section */}
            <div className="mx-auto max-w-3xl space-y-4 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Not an Engine.{' '}
                    <span className="text-primary">Your Personal Coach.</span>
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground">
                    This platform isn't here to calculate moves for you. It's
                    here to help you remember <strong>why</strong> you made
                    mistakes so you never make them again.
                </p>
            </div>

            <Separator className="mx-auto max-w-2xl" />

            {/* Core Philosophy */}
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                <Card className="border-red-100 bg-gradient-to-br from-red-50 to-orange-50 md:col-span-2 dark:from-red-950/30 dark:to-orange-950/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                            <XCircle className="h-5 w-5" />
                            What This Is NOT
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-muted-foreground">
                        <p>
                            ❌ <strong>Not a Chess Engine:</strong> We don't
                            analyze your games automatically. Stockfish can tell
                            you <em>what</em> the best move is, but it can't
                            teach you <em>why</em> you missed it.
                        </p>
                        <p>
                            ❌ <strong>Not Automated:</strong> Nothing is
                            fetched from your games automatically. If you want
                            passive analysis, there are many other tools for
                            that.
                        </p>
                        <p>
                            ❌ <strong>Not Click-Based:</strong> You won't be
                            dragging pieces on a board. We force you to type
                            algebraic notation to reinforce board visualization.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 md:col-span-2 dark:from-green-950/30 dark:to-emerald-950/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle2 className="h-5 w-5" />
                            What This IS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-muted-foreground">
                        <p>
                            ✅ <strong>Your Personal Flashcard Deck:</strong>{' '}
                            Just like medical students or language learners, you
                            curate your own deck of difficult positions.
                        </p>
                        <p>
                            ✅ <strong>Awareness Training:</strong> By manually
                            entering your blunders, you are forced to admit the
                            mistake, analyze it, and articulate <em>why</em> it
                            was wrong.
                        </p>
                        <p>
                            ✅ <strong>Contextual Memory:</strong> You tag each
                            card with your ELO at the time, the opening, and a
                            personal note. This creates a rich memory hook for
                            future review.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* The "Why Manual?" Section */}
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Why Make It So Hard?</h2>
                    <p className="text-muted-foreground">
                        Why manual entry? Why typing notation? Here is the
                        science.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    {/* Feature 1 */}
                    <Card className="flex flex-col items-center p-6 text-center">
                        <div className="mb-4 rounded-full bg-primary/10 p-3">
                            <PenTool className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-2 font-semibold">Active Recall</h3>
                        <p className="text-sm text-muted-foreground">
                            Typing the move (e.g.,{' '}
                            <code className="rounded bg-muted px-1">Nf3</code>)
                            forces your brain to visualize the board and
                            calculate coordinates, strengthening neural pathways
                            far more than simply clicking a square.
                        </p>
                    </Card>

                    {/* Feature 2 */}
                    <Card className="flex flex-col items-center p-6 text-center">
                        <div className="mb-4 rounded-full bg-primary/10 p-3">
                            <Eye className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-2 font-semibold">
                            Conscious Admission
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Engines hide the human element. By manually adding a
                            card, you take ownership:{' '}
                            <em>"I messed up here."</em> That emotional tag
                            makes the lesson stickier.
                        </p>
                    </Card>

                    {/* Feature 3 */}
                    <Card className="flex flex-col items-center p-6 text-center">
                        <div className="mb-4 rounded-full bg-primary/10 p-3">
                            <Database className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-2 font-semibold">Flexible Context</h3>
                        <p className="text-sm text-muted-foreground">
                            Was it an opening trap? A tactical blindspot? A
                            time-pressure panic? You define the category. You
                            add the note. You control the learning context.
                        </p>
                    </Card>
                </div>
            </div>

            <Separator className="mx-auto max-w-2xl" />

            {/* Feature Breakdown Grid */}
            <div className="mx-auto w-full max-w-5xl">
                <h2 className="mb-8 text-center text-2xl font-bold">
                    Anatomy of a Blunder Card
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="h-4 w-4 text-blue-500" />
                                The Position (FEN)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            The exact board state <strong>before</strong> your
                            blunder. Since you manually added this card, the
                            correct move is the one{' '}
                            <strong>you identified</strong> from your own game
                            analysis.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BrainCircuit className="h-4 w-4 text-purple-500" />
                                The Note / Remark
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <strong>The most important field.</strong> Write a
                            hint to your future self.
                            <em>"I missed the back-rank mate"</em> or{' '}
                            <em>"Don't push f6 too early."</em> This connects
                            the logic to the visual.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                Your ELO at Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Tagging the ELO helps you filter later. Maybe you
                            make different mistakes at 800 vs 1200. Track your
                            growth by reviewing old ELO brackets.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BookOpen className="h-4 w-4 text-green-500" />
                                Opening Name
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Identify patterns. Are you constantly failing in the
                            Sicilian? The King's Gambit? Use filters to practice
                            specific openings where you are weak.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <LinkIcon className="h-4 w-4 text-pink-500" />
                                Game Source URL
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Link back to the original game (Lichess, Chess.com,
                            etc.). If you forget the full context, click the
                            link to see how you reached that disastrous
                            position.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Search className="h-4 w-4 text-orange-500" />
                                Spaced Repetition
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            The system automatically schedules when you see this
                            card again. Get it right? You won't see it for a
                            while. Get it wrong? It comes back soon.
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Final CTA */}
            <div className="mx-auto max-w-2xl text-center">
                <Card className="border-none bg-transparent shadow-none">
                    <CardContent className="p-8">
                        <Lightbulb className="mx-auto mb-4 h-12 w-12" />
                        <h2 className="mb-2 text-2xl font-bold">
                            Ready to build your library?
                        </h2>
                        <p className="mb-1">
                            The best way to learn is to confront your own
                            mistakes head-on. Start by adding your first blunder
                            today.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
