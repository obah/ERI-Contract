"use client";

import React from "react";
import {
  FileTextIcon,
  ShieldCheckIcon,
  GlobeIcon,
  BookOpenIcon,
  ExternalLinkIcon,
  CodeIcon,
} from "lucide-react";

export default function ResourcesPage() {
  const resources = [
    {
      title: "Documentation",
      description: "Learn how to use the ERI Contract platform effectively.",
      icon: BookOpenIcon,
      href: "#",
      color: "bg-blue-500",
    },
    {
      title: "API Reference",
      description: "Technical documentation for developers and integrators.",
      icon: CodeIcon,
      href: "#",
      color: "bg-green-500",
    },
    {
      title: "Security Guide",
      description: "Best practices for securing your digital contracts.",
      icon: ShieldCheckIcon,
      href: "#",
      color: "bg-red-500",
    },
    {
      title: "Support",
      description: "Get help and support for any issues you encounter.",
      icon: GlobeIcon,
      href: "#",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Resources</h1>
          <p className="text-lg text-gray-600">
            Find helpful resources, documentation, and support for the ERI
            Contract platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div
                className={`inline-flex p-3 rounded-lg ${resource.color} text-white mb-4`}
              >
                <resource.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {resource.title}
              </h3>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <a
                href={resource.href}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Learn more
                <ExternalLinkIcon className="h-4 w-4 ml-1" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileTextIcon className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Authenticity Verification</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Ownership Management</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
