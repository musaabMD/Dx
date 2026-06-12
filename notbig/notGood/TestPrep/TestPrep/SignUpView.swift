//
//  SignUpView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct SignUpView: View {
    @Environment(AppState.self) private var appState
    @State private var name = ""
    @State private var email = ""
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color.blue.opacity(0.4), Color.purple.opacity(0.4)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 30) {
                Spacer()
                
                // App logo
                VStack(spacing: 20) {
                    Image(systemName: "graduationcap.fill")
                        .font(.system(size: 70))
                        .foregroundStyle(.white)
                        .frame(width: 120, height: 120)
                        .glassEffect(.regular.tint(.blue), in: .rect(cornerRadius: 25))
                        .scaleEffect(isAnimating ? 1.0 : 0.8)
                        .opacity(isAnimating ? 1.0 : 0.0)
                    
                    Text("Welcome to TestPrep")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .opacity(isAnimating ? 1.0 : 0.0)
                }
                
                Spacer()
                
                // Sign up form
                VStack(spacing: 20) {
                    // Name field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Name")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        
                        TextField("Enter your name", text: $name)
                            .textFieldStyle(.plain)
                            .padding()
                            .background(Color.white.opacity(0.2))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.white.opacity(0.3), lineWidth: 1)
                            )
                    }
                    
                    // Email field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Email")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        
                        TextField("Enter your email", text: $email)
                            .textFieldStyle(.plain)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)
                            .padding()
                            .background(Color.white.opacity(0.2))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.white.opacity(0.3), lineWidth: 1)
                            )
                    }
                    
                    // Sign up button
                    Button {
                        if !name.isEmpty && !email.isEmpty {
                            appState.signUp(name: name, email: email)
                        }
                    } label: {
                        HStack {
                            Text("Get Started")
                                .font(.headline)
                            Image(systemName: "arrow.right")
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                colors: [Color.blue, Color.purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
                    }
                    .disabled(name.isEmpty || email.isEmpty)
                    .opacity(name.isEmpty || email.isEmpty ? 0.6 : 1.0)
                    .padding(.top, 10)
                }
                .padding(.horizontal, 30)
                .padding(.bottom, 50)
            }
        }
        .onAppear {
            withAnimation(.spring(duration: 0.8, bounce: 0.4)) {
                isAnimating = true
            }
        }
    }
}

#Preview {
    SignUpView()
        .environment(AppState())
}
