"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  GlobeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  FactoryIcon,
  UserCheckIcon,
  KeyIcon,
  SearchIcon,
} from "lucide-react";
import { PAGE_LINKS } from "@/lib/constants";

export default function Home() {
  const features = [
    {
      title: "Item Registration & Verification",
      description:
        "Manufacturers register their products and consumers verify authenticity",
      icon: FactoryIcon,
      color: "bg-blue-500",
      href: PAGE_LINKS.AUTHENTICITY,
      details: [
        "Register manufactured items securely",
        "Generate unique authenticity codes",
        "Verify product authenticity instantly",
        "Combat counterfeiting effectively",
      ],
    },
    {
      title: "Ownership Management",
      description: "Gain, transfer, prove and verify ownership of items",
      icon: KeyIcon,
      color: "bg-green-500",
      href: PAGE_LINKS.OWNERSHIP,
      details: [
        "Establish digital ownership records",
        "Transfer ownership securely",
        "Prove ownership with blockchain",
        "Verify ownership history",
      ],
    },
    {
      title: "Resources & Support",
      description: "Access documentation, guides, and support resources",
      icon: GlobeIcon,
      color: "bg-purple-500",
      href: PAGE_LINKS.RESOURCES,
      details: [
        "API documentation",
        "Integration guides",
        "Security best practices",
        "Technical support",
      ],
    },
  ];

  const benefits = [
    "Blockchain-powered security",
    "Immutable authenticity records",
    "Transparent ownership history",
    "Real-time verification",
    "Anti-counterfeiting protection",
    "Easy integration for manufacturers",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
      <Navbar />

      <main className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Electronic Record Integrity - E.R.I
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            The trusted platform for manufacturers to register their products
            and for consumers to verify authenticity. Plus, complete ownership
            management for secure transfers and verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={PAGE_LINKS.AUTHENTICITY}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              <SearchIcon className="h-5 w-5 mr-2" />
              Verify Authenticity
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            <Link
              href={PAGE_LINKS.OWNERSHIP}
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              <KeyIcon className="h-5 w-5 mr-2" />
              Manage Ownership
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            How ERI Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Manufacturers */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <FactoryIcon className="h-6 w-6 mr-3 text-blue-600" />
                For Manufacturers
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Register Your Products
                    </h4>
                    <p className="text-gray-600">
                      Securely register your manufactured items on the
                      blockchain
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Generate Authenticity Codes
                    </h4>
                    <p className="text-gray-600">
                      Get unique verification codes for each product
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Protect Your Brand
                    </h4>
                    <p className="text-gray-600">
                      Combat counterfeiting and protect your intellectual
                      property
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Consumers */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <UserCheckIcon className="h-6 w-6 mr-3 text-green-600" />
                For Consumers
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Verify Authenticity
                    </h4>
                    <p className="text-gray-600">
                      Check if your product is genuine using the verification
                      code
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Manage Ownership
                    </h4>
                    <p className="text-gray-600">
                      Establish and transfer ownership of your items securely
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Prove Ownership
                    </h4>
                    <p className="text-gray-600">
                      Access complete ownership history and proof of ownership
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
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
              <ul className="space-y-2 mb-6">
                {feature.details.map((detail, detailIndex) => (
                  <li
                    key={detailIndex}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
              <Link
                href={feature.href}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Get Started
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Link>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Why Choose ERI?
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
            Join manufacturers and consumers who trust ERI for authenticity
            verification and ownership management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={PAGE_LINKS.AUTHENTICITY}
              className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              <SearchIcon className="h-5 w-5 mr-2" />
              Verify Authenticity
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            <Link
              href={PAGE_LINKS.OWNERSHIP}
              className="inline-flex items-center border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              <KeyIcon className="h-5 w-5 mr-2" />
              Manage Ownership
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
