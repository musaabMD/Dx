"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { Suspense } from "react";

export default function ExamsListClient({ examsData }) {
    return (
        <>
            <Header />
            <div className="container mx-auto p-4">
                <br />
                <h1 className="text-4xl font-bold mb-4">Available Exams</h1>
                <br />
                <br />
                <ul className="space-y-2">
                    {examsData.map((exam, index) => (
                        <li key={index} className="bg-slate-100 border-3 shadow rounded p-5 border-2 border-slate-500 hover:bg-slate-200">
                            <Link href={`/exams/${encodeURIComponent(exam.examname)}`}>
                                <span className="text-blue-600 text-3xl font-sans font-semibold">{exam.examname}</span>
                            </Link>
                            <p className="mt-2">
                                {exam.fileCount} Files, {exam.questionCount} Questions
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
