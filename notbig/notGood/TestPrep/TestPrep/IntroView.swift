//
//  IntroView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct IntroView: View {
    @State private var currentPage = 0
    @Binding var showIntro: Bool
    
    let features = [
        FeatureIntro(
            icon: "book.fill",
            title: "Smart Question Bank",
            description: "Access thousands of questions organized by subjects, topics, and difficulty levels",
            color: Color.blue
        ),
        FeatureIntro(
            icon: "chart.line.uptrend.xyaxis",
            title: "Track Your Progress",
            description: "Monitor your performance with detailed analytics and maintain your study streak",
            color: Color.green
        ),
        FeatureIntro(
            icon: "sparkles",
            title: "AI-Powered Learning",
            description: "Get instant explanations and ask AI to dive deeper into any topic",
            color: Color.purple
        ),
        FeatureIntro(
            icon: "trophy.fill",
            title: "Compete & Excel",
            description: "Join the leaderboard, compete with peers, and achieve your goals",
            color: Color.orange
        )
    ]
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [features[currentPage].color.opacity(0.3), features[currentPage].color.opacity(0.1)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            .animation(.easeInOut(duration: 0.5), value: currentPage)
            
            VStack {
                // Skip button
                HStack {
                    Spacer()
                    Button("Skip") {
                        withAnimation {
                            showIntro = false
                        }
                    }
                    .foregroundStyle(.secondary)
                    .padding()
                }
                
                // Tab view for features
                TabView(selection: $currentPage) {
                    ForEach(features.indices, id: \.self) { index in
                        FeatureCard(feature: features[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                
                // Custom page indicator
                HStack(spacing: 8) {
                    ForEach(features.indices, id: \.self) { index in
                        Circle()
                            .fill(currentPage == index ? features[currentPage].color : Color.gray.opacity(0.3))
                            .frame(width: currentPage == index ? 10 : 8, height: currentPage == index ? 10 : 8)
                            .animation(.spring(duration: 0.3), value: currentPage)
                    }
                }
                .padding(.vertical)
                
                // Action button
                Button {
                    if currentPage < features.count - 1 {
                        withAnimation {
                            currentPage += 1
                        }
                    } else {
                        withAnimation {
                            showIntro = false
                        }
                    }
                } label: {
                    Text(currentPage < features.count - 1 ? "Next" : "Get Started")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(features[currentPage].color)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 30)
            }
        }
    }
}

struct FeatureIntro: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let description: String
    let color: Color
}

struct FeatureCard: View {
    let feature: FeatureIntro
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            // Icon with glass effect
            ZStack {
                Image(systemName: feature.icon)
                    .font(.system(size: 60))
                    .foregroundStyle(feature.color)
            }
            .frame(width: 140, height: 140)
            .glassEffect(.regular.tint(feature.color), in: .rect(cornerRadius: 30))
            
            VStack(spacing: 16) {
                Text(feature.title)
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .multilineTextAlignment(.center)
                
                Text(feature.description)
                    .font(.title3)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }
            
            Spacer()
        }
        .padding()
    }
}

#Preview {
    IntroView(showIntro: .constant(true))
}
