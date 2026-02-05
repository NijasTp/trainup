
import React from 'react';

const Placeholder = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-gray-500">
        <h1 className="text-4xl font-black mb-4">{title}</h1>
        <p>This page is under construction.</p>
    </div>
);

export const Dashboard = () => <Placeholder title="Dashboard" />;
export const Profile = () => <Placeholder title="Profile" />;
export const Plans = () => <Placeholder title="Plans" />;
export const Equipment = () => <Placeholder title="Equipment" />;
export const Members = () => <Placeholder title="Members" />;
export const Attendance = () => <Placeholder title="Attendance" />;
export const Store = () => <Placeholder title="Store" />;
export const Announcements = () => <Placeholder title="Announcements" />;
export const Jobs = () => <Placeholder title="Jobs" />;
export const Workouts = () => <Placeholder title="Workouts" />;
export const Register = () => <Placeholder title="Register" />;
