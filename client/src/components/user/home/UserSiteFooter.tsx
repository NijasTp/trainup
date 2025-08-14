
export const SiteFooter=()=> {
  return (
    <footer className="mt-8 border-t border-border/60">
      <div className="container py-8 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} TrainUp</p>
          <nav className="flex items-center gap-4">
            <a href="/workouts" className="story-link">Workouts</a>
            <a href="/diet" className="story-link">Diet</a>
            <a href="/trainers" className="story-link">Trainers</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}