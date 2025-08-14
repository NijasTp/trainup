import { Card, CardContent } from "@/components/ui/card";

export function CommunityPreview() {
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
