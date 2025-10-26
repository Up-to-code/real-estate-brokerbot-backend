"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRelativeTime = formatRelativeTime;
function formatRelativeTime(date) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    if (seconds < 60)
        return "الآن";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return `قبل ${minutes} دقيقة${minutes > 1 ? "s" : ""}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `قبل ${hours} ساعة${hours > 1 ? "s" : ""}`;
    const days = Math.floor(hours / 24);
    if (days < 30)
        return `قبل ${days} يوم${days > 1 ? "ًا" : ""}`;
    const months = Math.floor(days / 30);
    if (months < 12)
        return `قبل ${months} شهر${months > 1 ? "ًا" : ""}`;
    const years = Math.floor(months / 12);
    return `قبل ${years} سنة${years > 1 ? "s" : ""}`;
}
