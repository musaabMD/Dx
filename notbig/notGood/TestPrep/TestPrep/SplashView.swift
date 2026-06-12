//
//  SplashView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct SplashView: View {
    @State private var isAnimating = false
    @State private var showContent = false
    @Binding var showSplash: Bool
    
    var body: some View {
        ZStack {
            // Clean blue background
            Color.blue
                .ignoresSafeArea()
            
            VStack(spacing: 30) {
                // App Icon
                Image(systemName: "graduationcap.circle.fill")
                    .font(.system(size: 100))
                    .foregroundStyle(.white)
                    .scaleEffect(isAnimating ? 1.0 : 0.5)
                    .opacity(isAnimating ? 1.0 : 0.0)
                
                if showContent {
                    VStack(spacing: 12) {
                        Text("TestPrep")
                            .font(.system(size: 42, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                        
                        Text("Master Your Exams")
                            .font(.title3)
                            .foregroundStyle(.white.opacity(0.9))
                    }
                    .transition(.scale.combined(with: .opacity))
                }
            }
        }
        .onAppear {
            withAnimation(.spring(duration: 0.8, bounce: 0.4)) {
                isAnimating = true
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                withAnimation(.easeInOut(duration: 0.6)) {
                    showContent = true
                }
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                withAnimation(.easeInOut(duration: 0.5)) {
                    showSplash = false
                }
            }
        }
    }
}

#Preview {
    SplashView(showSplash: .constant(true))
}
