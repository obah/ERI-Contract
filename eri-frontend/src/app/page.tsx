"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  ShieldCheckIcon,
  FileTextIcon,
  GlobeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "lucide-react";
import { PAGE_LINKS } from "@/lib/constants";

export default function Home() {
  const features = [
    {
      title: "Document Authenticity",
      description:
        "Verify the authenticity of your documents using blockchain technology",
      icon: ShieldCheckIcon,
      color: "bg-blue-500",
      href: PAGE_LINKS.AUTHENTICITY,
    },
    {
      title: "Ownership Verification",
      description:
        "Manage and verify ownership of your digital assets and contracts",
      icon: FileTextIcon,
      color: "bg-green-500",
      href: PAGE_LINKS.OWNERSHIP,
    },
    {
      title: "Resources & Support",
      description: "Access documentation, guides, and support resources",
      icon: GlobeIcon,
      color: "bg-purple-500",
      href: PAGE_LINKS.RESOURCES,
    },
  ];

  const benefits = [
    "Secure blockchain-based verification",
    "Immutable ownership records",
    "Easy-to-use interface",
    "Real-time verification",
    "Comprehensive audit trails",
    "24/7 platform availability",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
      <Navbar />

      <main className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            ERI Contract Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Secure, transparent, and reliable document authenticity and
            ownership verification powered by blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/authenticity"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Verify Authenticity
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            <Link
              href="/ownership"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Manage Ownership
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div
                className={`inline-flex p-4 rounded-lg ${feature.color} text-white mb-6`}
              >
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              <div className="flex items-center text-blue-600 font-medium">
                Get Started
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </div>
            </Link>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Why Choose ERI Contract?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust ERI Contract for their document
            verification needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/authenticity"
              className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Start Verification
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
