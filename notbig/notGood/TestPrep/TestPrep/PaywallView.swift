//
//  PaywallView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct PaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    
    let features = [
        PaywallFeature(icon: "infinity", title: "Unlimited Questions", description: "No daily limits - study as much as you want"),
        PaywallFeature(icon: "brain.head.profile", title: "AI Learning Assistant", description: "Get personalized explanations and insights"),
        PaywallFeature(icon: "chart.bar.fill", title: "Advanced Analytics", description: "Track detailed performance metrics"),
        PaywallFeature(icon: "star.fill", title: "Priority Support", description: "Get help when you need it most"),
        PaywallFeature(icon: "arrow.down.circle.fill", title: "Offline Access", description: "Download questions for offline study"),
        PaywallFeature(icon: "gift.fill", title: "Exclusive Content", description: "Access premium mock exams and materials")
    ]
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color.purple.opacity(0.4), Color.blue.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 30) {
                        // Header
                        VStack(spacing: 16) {
                            Image(systemName: "crown.fill")
                                .font(.system(size: 60))
                                .foregroundStyle(.yellow)
                                .frame(width: 100, height: 100)
                                .glassEffect(.regular.tint(.yellow), in: .rect(cornerRadius: 20))
                            
                            Text("Upgrade to Premium")
                                .font(.system(size: 36, weight: .bold, design: .rounded))
                            
                            Text("Unlock unlimited learning potential")
                                .font(.title3)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.top, 30)
                        
                        // Features grid
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                            ForEach(features) { feature in
                                FeatureCardView(feature: feature)
                            }
                        }
                        .padding(.horizontal)
                        
                        // Pricing
                        VStack(spacing: 20) {
                            PricingCard(
                                title: "Monthly",
                                price: "$9.99",
                                period: "per month",
                                isPopular: false
                            )
                            
                            PricingCard(
                                title: "Yearly",
                                price: "$79.99",
                                period: "per year",
                                savings: "Save 33%",
                                isPopular: true
                            )
                        }
                        .padding(.horizontal)
                        
                        // CTA Button
                        Button {
                            appState.upgradeToPremium()
                            dismiss()
                        } label: {
                            Text("Start Free Trial")
                                .font(.headline)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(
                                    LinearGradient(
                                        colors: [Color.purple, Color.blue],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                                .shadow(color: .purple.opacity(0.5), radius: 10, x: 0, y: 5)
                        }
                        .padding(.horizontal, 40)
                        
                        // Terms
                        Text("7-day free trial, then $9.99/month. Cancel anytime.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 40)
                            .padding(.bottom, 30)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
    }
}

struct PaywallFeature: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let description: String
}

struct FeatureCardView: View {
    let feature: PaywallFeature
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: feature.icon)
                .font(.title)
                .foregroundStyle(.blue)
            
            Text(feature.title)
                .font(.headline)
            
            Text(feature.description)
                .font(.caption)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.white.opacity(0.15))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .glassEffect(.regular, in: .rect(cornerRadius: 16))
    }
}

struct PricingCard: View {
    let title: String
    let price: String
    let period: String
    var savings: String?
    let isPopular: Bool
    
    var body: some View {
        VStack(spacing: 16) {
            if isPopular {
                Text("MOST POPULAR")
                    .font(.caption.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.orange)
                    .clipShape(Capsule())
            }
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.title2.bold())
                
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(price)
                        .font(.system(size: 36, weight: .bold))
                    Text(period)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                
                if let savings = savings {
                    Text(savings)
                        .font(.subheadline.bold())
                        .foregroundStyle(.green)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white.opacity(isPopular ? 0.25 : 0.15))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(isPopular ? Color.orange : Color.clear, lineWidth: 2)
        )
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
    }
}

#Preview {
    PaywallView()
        .environment(AppState())
}
