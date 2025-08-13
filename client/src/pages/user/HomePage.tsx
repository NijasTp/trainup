import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutApi} from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  Dumbbell,
  Flame,
  Star,
  CalendarClock,
  Megaphone,
  Users,
  MessageCircle,
  ShieldCheck,
  Timer,
} from "lucide-react";
import type { RootState } from "@/redux/store";
import { getTrainers } from "@/services/userService";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "@/redux/slices/userAuthSlice";



export default function HomePage() {
  useEffect(() => {
    document.title = "TrainUp - Dashboard";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Your fitness hub: stats, workouts, diet, trainers and community.");

    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container py-6 space-y-8 animate-fade-in">
        <Hero />
        <QuickStats />
        <TrainerCarousel />
        <Upcoming />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SuggestedWorkouts />
            <CommunityPreview />
          </div>
          <div className="space-y-6">
            <GymAnnouncements />
            <TipOfTheDay />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}




interface SiteHeaderProps {}

export const SiteHeader: React.FC<SiteHeaderProps> = () => {
  const user = useSelector((state: RootState) => state.userAuth.user);
  const userName = user?.name || "Me";
  const userAvatar =
    user?.profileImage ||
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop";
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleSignOut = async () => {
    console.log("sign out clicked");
    dispatch(logout());
     logoutApi();
    toast.success('Successfully signed out');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container h-16 flex items-center gap-4">
        {/* Logo */}
        <a
          href="/home"
          className="flex items-center gap-2 font-display text-xl tracking-wider"
        >
          <span className="font-extrabold">TRAIN</span>
          <span className="text-accent font-extrabold">UP</span>
        </a>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl ml-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workouts, diets, trainers..."
              className="pl-9 bg-secondary/40"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="p-2 rounded hover:bg-muted-foreground/5">
              <div className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 rounded-full bg-amber-400 text-[10px] grid place-items-center">
                  2
                </span>
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              align="end"
              className="w-72 rounded-md border bg-popover text-popover-foreground shadow-md"
            >
              <DropdownMenu.Label className="px-2 py-1 text-sm font-semibold">
                Notifications
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="h-px bg-muted" />
              <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1 text-sm">
                <CalendarClock className="h-8 w-4 text-accent" />
                Next session in 3h 12m
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1 text-sm">
                <Megaphone className="h-8 w-4 text-accent" />
                New gym announcement
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1 text-sm">
                <Users className="h-8 w-4 text-accent" />
                Trainer accepted your request
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Avatar / Account dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted-foreground/5">
              <Avatar className="h-6 w-6">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>
                  {userName[0]?.toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{userName}</span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              align="end"
              className="w-56 rounded-md border bg-popover text-popover-foreground shadow-md"
            >
              <DropdownMenu.Label className="px-2 cursor-pointer py-2 text-sm font-semibold">
                My Account
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="h-px bg-muted" />
              <DropdownMenu.Item asChild>
                <a href="/profile" className="block cursor-pointer px-2 py-2 text-sm">
                  Profile
                </a>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <a href="/settings" className="block px-2 cursor-pointer py-2 text-sm">
                  Settings
                </a>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="px-2 cursor-pointer py-2 text-sm"
                onSelect={handleSignOut}
              >
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
};


function Hero() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-secondary/40 to-background">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1570829460005-c840387bb1ca?q=80&w=1600&auto=format&fit=crop"
          alt="Energetic gym scene"
          className="w-full h-full object-cover opacity-20"
          loading="lazy"
        />
      </div>
      <div className="relative p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">
            "Discipline beats motivation. Show up, get better."
          </h1>

          <div className="flex items-center gap-3 pt-2">
            <Badge className="bg-accent text-accent-foreground">Streak: 12 days</Badge>
            <Badge variant="secondary">XP: 2,450</Badge>
          </div>
          <div className="pt-2 flex gap-3">
            <a href="/workouts" className="hover-scale">
              <Button className="bg-accent text-accent-foreground shadow-[var(--shadow-glow)]">Start Workout</Button>
            </a>
            <a href="/diet" className="hover-scale">
              <Button variant="secondary">Plan Meals</Button>
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop"
            alt="Athlete training hard"
            className="w-full h-[300px] object-cover rounded-lg border border-border"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function QuickStats() {
  const stats = [
    { label: "Calories Today", value: "1,240 kcal", icon: Flame },
    { label: "Workouts This Week", value: "4", icon: Dumbbell },
    { label: "XP", value: "2,450", icon: Star },
    { label: "Streak", value: "12 days", icon: Timer },
  ];
  return (
    <section aria-labelledby="quick-stats">
      <h2 id="quick-stats" className="sr-only">Quick stats</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

interface ITrainer {
  _id: number;
  name: string;
  profileImage: string;
  specialty: string;
}

function TrainerCarousel() {
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrainers() {
      try {
        setIsLoading(true);
        const response = await getTrainers(1,5,'');
        console.log('Fetched trainers:', response.trainers.trainers);
        setTrainers(response.trainers.trainers);
      } catch (err: any) {
        setError(err.response.data.error || 'failed to fetch trainers. Please try again.');
        toast.error(err.response.data.error || 'failed to fetch trainers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrainers();
  }, []);

  if (isLoading) {
    return (
      <section aria-labelledby="trainers">
        <h2 id="trainers" className="text-xl font-semibold mb-3">Featured Trainers</h2>
        <p className="text-muted-foreground">Loading trainers...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-labelledby="trainers">
        <h2 id="trainers" className="text-xl font-semibold mb-3">Featured Trainers</h2>
        <p className="text-destructive">Error: {error}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="trainers">
      <div className="flex items-center justify-between mb-3">
        <h2 id="trainers" className="text-xl font-semibold">Featured Trainers</h2>

      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {trainers.map((t: ITrainer) => (
          <Link to={`/trainers/${t._id}`}>
            <div key={t._id} className="min-w-[260px] snap-start">
              <Card className="h-full hover-scale">
                <CardContent className="p-0">
                  <img src={t.profileImage} alt={`${t.name} - ${t.specialty||''}`} className="h-50 w-50 ml-6 rounded-sm object-cover" loading="lazy" />
                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{t.name}</p>
                      <Badge className="bg-accent text-accent-foreground">Hire</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.specialty||''}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <Link to="/trainers">
          <Button variant="secondary">See More</Button>
        </Link>
      </div>
    </section>
  );
}

function Upcoming() {
  return (
    <section aria-labelledby="upcoming" className="grid gap-4 md:grid-cols-2">
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-accent" /> Next Trainer Session</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">with Ava Thompson</p>
              <p className="font-semibold">Today, 6:00 PM</p>
            </div>
            <Badge variant="secondary">in 3h 12m</Badge>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-accent" /> Next Meal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Chicken & Quinoa Bowl</p>
                <p className="text-sm text-muted-foreground">520 kcal • 35g P • 55g C • 16g F</p>
              </div>
              <Button variant="secondary">View</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function CommunityPreview() {
  const posts = [
    {
      author: "Jordan",
      text: "Hit a new PR on deadlifts today!",
      img: "https://images.unsplash.com/photo-1517963628607-235ccdd5476a?q=80&w=800&auto=format&fit=crop",
    },
    {
      author: "Maya",
      text: "Meal prep done for the week — feeling focused!",
      img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    },
    {
      author: "Arjun",
      text: "Yoga flow helped with my back pain. Recommend!",
      img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return (
    <section aria-labelledby="community">
      <div className="flex items-center justify-between mb-3">
        <h2 id="community" className="text-xl font-semibold">Community</h2>
        <a href="#" className="story-link text-sm text-muted-foreground">View all</a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Card key={i} className="hover-scale">
            <CardContent className="p-0">
              <img src={p.img} alt={p.text} className="h-40 w-full object-cover" loading="lazy" />
              <div className="p-4">
                <p className="text-sm text-muted-foreground">by {p.author}</p>
                <p className="font-medium">{p.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SuggestedWorkouts() {
  const workouts = [
    { title: "Full-Body Power 45", tag: "Trainer", difficulty: "Intermediate" },
    { title: "Core Crusher 20", tag: "You", difficulty: "Beginner" },
    { title: "Leg Day Inferno", tag: "Trainer", difficulty: "Advanced" },
    { title: "Mobility Flow 15", tag: "You", difficulty: "All" },
  ];
  return (
    <section aria-labelledby="suggested">
      <div className="flex items-center justify-between mb-3">
        <h2 id="suggested" className="text-xl font-semibold">Suggested Workouts</h2>
        <a href="/workouts" className="story-link text-sm text-muted-foreground">View all</a>
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {workouts.map((w) => (
          <div key={w.title} className="min-w-[260px] snap-start">
            <Card className="h-full hover-scale">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {w.title}
                  <Badge variant="secondary">{w.difficulty}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">Recommended by: {w.tag}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Dumbbell className="h-4 w-4" /> 8 exercises
                  </div>
                  <a href="/workouts" className="hover-scale"><Button size="sm">Start</Button></a>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}

function GymAnnouncements() {
  const announcements = [
    { title: "New equipment arrived", desc: "Try the latest squat racks and rowers." },
    { title: "Holiday hours", desc: "Open 7am–7pm this weekend." },
    { title: "Community run", desc: "Join our 5K fun run this Saturday." },
  ];
  return (
    <section aria-labelledby="announcements">
      <h2 id="announcements" className="text-xl font-semibold mb-3">Gym Announcements</h2>
      <div className="space-y-3">
        {announcements.slice(0, 3).map((a, i) => (
          <Card key={i} className="hover-scale">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Megaphone className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function TipOfTheDay() {
  return (
    <section aria-labelledby="tip">
      <Card className="bg-secondary/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-accent" /> Tip of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          Hydrate early and often. Aim for 250–300ml every 20 minutes during training.
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-5 w-5 text-accent" /> Progress Photo Reminder</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Stay accountable with weekly photos.</p>
          <Button variant="secondary" size="sm">Remind me</Button>
        </CardContent>
      </Card>
    </section>
  );
}

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