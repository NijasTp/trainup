import React, { useState, useEffect } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Upload, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { ProgressCalendar } from "@/components/user/progress/ProgressCalendar";
import { toast } from "sonner";
import { addProgress, getProgress } from "@/services/progressService";
import Aurora from "@/components/ui/Aurora";

const ProgressPage = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [notes, setNotes] = useState("");
    const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [markedDates, setMarkedDates] = useState<Date[]>([]);

    useEffect(() => {
        fetchProgress(selectedDate);
        fetchAllProgressDates();
    }, [selectedDate]);

    const fetchAllProgressDates = async () => {
        try {
            const data = await getProgress();
            if (data && data.progress && Array.isArray(data.progress)) {
                const dates = data.progress.map((p: any) => new Date(p.date));
                setMarkedDates(dates);
            }
        } catch (error) {
            console.error("Failed to fetch progress history:", error);
        }
    };


    const fetchProgress = async (date: Date) => {
        setIsLoading(true);
        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const data = await getProgress(formattedDate);
            if (data && data.progress) {
                setNotes(data.progress.notes || "");
                setExistingPhotos(data.progress.photos || []);
            } else {
                setNotes("");
                setExistingPhotos([]);
            }
            setNewPhotos([]); // Clear new uploads when changing date
        } catch (error) {
            console.error("Failed to fetch progress:", error);
            // Don't show error toast on 404/empty, just clear
            setNotes("");
            setExistingPhotos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (direction: "prev" | "next") => {
        setSelectedDate(direction === "prev" ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewPhotos(Array.from(e.target.files));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("date", selectedDate.toISOString());
            formData.append("notes", notes);
            newPhotos.forEach((photo) => {
                formData.append("photos", photo);
            });

            await addProgress(formData);
            toast.success("Progress saved successfully!");
            fetchProgress(selectedDate); // Refresh
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.response?.data?.message || "Failed to save progress");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-4 py-12 space-y-8 flex-1">
                <div className="flex flex-col gap-6">
                    {/* Date Navigation */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDateChange("prev")}
                                className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent min-w-[200px] text-center">
                                    {format(selectedDate, "MMMM d, yyyy")}
                                </h1>

                                <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
                                        >
                                            <CalendarIcon className="h-4 w-4 text-primary" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-fit p-0 border-border/50 bg-card/95 backdrop-blur-md">
                                        <ProgressCalendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date: Date | undefined) => {
                                                if (date) {
                                                    setSelectedDate(date);
                                                    setIsCalendarOpen(false);
                                                }
                                            }}
                                            className="rounded-md border"
                                            markedDates={markedDates}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDateChange("next")}
                                className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Photos Section */}
                        <Card className="bg-card/40 backdrop-blur-sm border-border/50 h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-primary" />
                                    Progress Photos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {existingPhotos.map((url, idx) => (
                                        <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border/50 group">
                                            <img src={url} alt={`Progress ${idx + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </div>
                                    ))}
                                    {newPhotos.map((file, idx) => (
                                        <div key={`new-${idx}`} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border/50 opacity-70">
                                            <img src={URL.createObjectURL(file)} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {isToday(selectedDate) ? (
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border-border/50">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            </div>
                                            <input id="photo-upload" type="file" className="hidden" multiple accept="image/*" onChange={handlePhotoUpload} />
                                        </label>
                                    </div>
                                ) : (
                                    existingPhotos.length === 0 && (
                                        <div className="flex items-center justify-center w-full h-32 border border-border/50 rounded-lg bg-accent/20">
                                            <p className="text-muted-foreground">No photos added</p>
                                        </div>
                                    )
                                )}
                            </CardContent>
                        </Card>

                        {/* Notes Section */}
                        <Card className="bg-card/40 backdrop-blur-sm border-border/50 h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Save className="h-5 w-5 text-primary" />
                                    Daily Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isToday(selectedDate) ? (
                                    <>
                                        <Textarea
                                            placeholder="How are you feeling today? Any achievements or struggles?"
                                            className="min-h-[300px] resize-none bg-background/50"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                        <Button
                                            className="w-full mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save Entry"
                                            )}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="min-h-[300px] p-4 rounded-md border border-border/50 bg-background/30">
                                        {notes ? (
                                            <p className="whitespace-pre-wrap text-foreground/90">{notes}</p>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                                No notes added for this day
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
            <SiteFooter />
        </div>
    );
};

export default ProgressPage;
