//
//  WeatherHomeView.swift
//  tripdb
//
//  Created by Musaab-HQ on 17/01/2026.
//

import SwiftUI

struct WeatherHomeView: View {
    @StateObject private var viewModel = CityViewModel()
    @State private var searchText = ""
    @State private var showSearch = false
    @State private var showFilters = false
    @State private var showBookmarked = false
    @State private var path = NavigationPath()
    @State private var filters = CityFilters()
    @State private var showBadgeDetails = false
    @State private var selectedBadge: HeaderBadge?
    
    private var visibleCities: [CityData] {
        filters.apply(to: viewModel.cities)
    }
    
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.06, green: 0.12, blue: 0.24),
                    Color(red: 0.05, green: 0.10, blue: 0.20),
                    Color(red: 0.03, green: 0.06, blue: 0.13)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            NavigationStack(path: $path) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        // Header - scrolls with content
                        headerView
                            .padding(.top, 8)
                            .padding(.bottom, 12)
                        
                        // City cards with consistent spacing
                        LazyVStack(spacing: 12) {
                            if visibleCities.isEmpty {
                                VStack(spacing: 12) {
                                    Image(systemName: "sparkles")
                                        .font(.system(size: 32))
                                        .foregroundColor(.white.opacity(0.6))
                                    
                                    Text("No matches")
                                        .font(.system(size: 18, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white)
                                    
                                    Text("Try clearing filters to see more destinations.")
                                        .font(.system(size: 14))
                                        .foregroundColor(.white.opacity(0.6))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 32)
                                .glassSurface(cornerRadius: 18, tintOpacity: 0.06, strokeOpacity: 0.18, shadowOpacity: 0.12)
                            } else {
                                ForEach(visibleCities) { city in
                                    NavigationLink(value: city) {
                                        CityCard(
                                            city: city,
                                            onBookmarkToggle: {
                                                viewModel.toggleBookmark(for: city.id)
                                            }
                                        )
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 100)
                }
                .navigationDestination(for: CityData.self) { city in
                    CityDetailView(city: city)
                }
            }
            
            // Bottom bar with buttons and search
            VStack {
                Spacer()
                bottomBarView
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
            .ignoresSafeArea(edges: .bottom)
            .zIndex(10)
            
            // Search overlay - covers entire screen
            if showSearch {
                SearchOverlayView(
                    isPresented: $showSearch,
                    searchText: $searchText,
                    cities: viewModel.cities,
                    onSelect: { city in
                        path.append(city)
                        showSearch = false
                    }
                )
                .zIndex(1000)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
            
            // Filter screen - shown when right button is clicked
            if showFilters {
                FilterView(isPresented: $showFilters, filters: $filters)
                    .zIndex(1000)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
            
            // Bookmarked screen - shown when left button is clicked
            if showBookmarked {
                BookmarkedView(
                    isPresented: $showBookmarked,
                    cities: viewModel.cities,
                    onBookmarkToggle: { cityId in
                        viewModel.toggleBookmark(for: cityId)
                    },
                    onSelect: { city in
                        path.append(city)
                        showBookmarked = false
                    }
                )
                .zIndex(1000)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: showSearch)
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: showFilters)
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: showBookmarked)
    }
    
    private var headerView: some View {
        HStack(alignment: .center, spacing: 10) {
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.12))
                        .frame(width: 36, height: 36)

                    Image(systemName: "location.fill")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                }

                Text("Triplst")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }

            Spacer()

            BadgeButton(
                title: "Streak",
                value: "12",
                icon: "flame.fill",
                color: Color(red: 0.98, green: 0.55, blue: 0.2)
            ) {
                selectedBadge = .streak
                showBadgeDetails = true
            }

            // Menu button - glass circle
            Button(action: {
                // Menu action
            }) {
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.08))
                        .frame(width: 36, height: 36)
                        .overlay(
                            Circle()
                                .stroke(Color.white.opacity(0.15), lineWidth: 1)
                        )

                    Image(systemName: "ellipsis")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }
            }
        }
        .overlay {
            if showBadgeDetails, let badge = selectedBadge {
                BadgePopup(badge: badge) {
                    showBadgeDetails = false
                }
            }
        }
    }
    
    private var bottomBarView: some View {
        GeometryReader { geometry in
            HStack(spacing: 12) {
                // Left button - Bookmark
                Button(action: {
                    showBookmarked = true
                }) {
                    ZStack {
                        Circle()
                            .fill(Color.white.opacity(0.08))
                            .frame(width: 44, height: 44)
                            .overlay(
                                Circle()
                                    .stroke(Color.white.opacity(0.18), lineWidth: 1)
                            )

                        Image(systemName: "bookmark.fill")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundColor(.white)
                    }
                }

                // Center - Search bar
                searchBarView

                // Right button - Filters
                Button(action: {
                    showFilters = true
                }) {
                    ZStack {
                        Circle()
                            .fill(Color.white.opacity(0.08))
                            .frame(width: 44, height: 44)
                            .overlay(
                                Circle()
                                    .stroke(Color.white.opacity(0.18), lineWidth: 1)
                            )

                        Image(systemName: "slider.horizontal.3")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundColor(.white)

                        if filters.activeCount > 0 {
                            Text("\(filters.activeCount)")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                                .padding(6)
                                .background(Color.red.opacity(0.85), in: Circle())
                                .offset(x: 16, y: -16)
                        }
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(Color.black.opacity(0.25))
                    .overlay(
                        RoundedRectangle(cornerRadius: 28, style: .continuous)
                            .stroke(Color.white.opacity(0.15), lineWidth: 1)
                    )
            )
            .padding(.horizontal, 16)
            .padding(.bottom, geometry.safeAreaInsets.bottom + 8)
            .frame(maxWidth: .infinity)
        }
        .frame(height: 80)
    }
    
    private var searchBarView: some View {
        Button(action: {
            showSearch = true
        }) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.white.opacity(0.7))
                    .font(.system(size: 15, weight: .semibold))

                Text("Search for a city")
                    .foregroundColor(.white.opacity(0.7))
                    .font(.system(size: 15, weight: .medium))
                    .lineLimit(1)

                Spacer()
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity)
            .background(
                Capsule()
                    .fill(Color.white.opacity(0.08))
                    .overlay(
                        Capsule()
                            .stroke(Color.white.opacity(0.18), lineWidth: 1)
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Search Overlay View

struct SearchOverlayView: View {
    @Binding var isPresented: Bool
    @Binding var searchText: String
    let cities: [CityData]
    let onSelect: (CityData) -> Void
    @FocusState private var isSearchFocused: Bool
    
    var filteredCities: [CityData] {
        if searchText.isEmpty {
            return cities
        }
        return cities.filter { city in
            city.cityName.localizedCaseInsensitiveContains(searchText) ||
            city.country.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Dimmed background - covers everything including tab bar
                Color.black.opacity(0.4)
                    .ignoresSafeArea()
                    .onTapGesture {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                            isPresented = false
                        }
                        searchText = ""
                    }
                
                // Search card - extends to bottom edge
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Button(action: {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                                isPresented = false
                            }
                            searchText = ""
                        }) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.1))
                                    .frame(width: 36, height: 36)
                                
                                Image(systemName: "xmark")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                        
                        Spacer()
                        
                        Text("Search")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        // Placeholder for symmetry
                        Circle()
                            .fill(Color.clear)
                            .frame(width: 36, height: 36)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 20)
                    
                    // Search bar
                    HStack(spacing: 10) {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.white.opacity(0.5))
                            .font(.system(size: 17))
                        
                        TextField("", text: $searchText, prompt: Text("Search for a city or airport")
                            .foregroundColor(.white.opacity(0.4)))
                            .foregroundColor(.white)
                            .font(.system(size: 17))
                            .focused($isSearchFocused)
                            .submitLabel(.search)
                        
                        if !searchText.isEmpty {
                            Button(action: {
                                searchText = ""
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.white.opacity(0.5))
                                    .font(.system(size: 16))
                            }
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .glassSurface(cornerRadius: 14, tintOpacity: 0.06, strokeOpacity: 0.2, shadowOpacity: 0.1)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
                    
                    // Cities list
                    ScrollView(showsIndicators: false) {
                        VStack(alignment: .leading, spacing: 0) {
                            Text("Find Nearby")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 20)
                                .padding(.bottom, 16)
                            
                            if filteredCities.isEmpty {
                                Text("No cities found")
                                    .font(.system(size: 15))
                                    .foregroundColor(.white.opacity(0.5))
                                    .padding(.horizontal, 20)
                                    .padding(.top, 20)
                            } else {
                                VStack(spacing: 0) {
                                    ForEach(Array(filteredCities.enumerated()), id: \.element.id) { index, city in
                                        CitySearchRow(city: city) {
                                            // Handle city selection
                                            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                                                isPresented = false
                                            }
                                            searchText = ""
                                            onSelect(city)
                                        }
                                        
                                        if index < filteredCities.count - 1 {
                                            Rectangle()
                                                .fill(Color.white.opacity(0.08))
                                                .frame(height: 1)
                                                .padding(.leading, 68)
                                        }
                                    }
                                }
                                .glassSurface(cornerRadius: 16, tintOpacity: 0.06, strokeOpacity: 0.2, shadowOpacity: 0.1)
                                .padding(.horizontal, 16)
                            }
                            
                            // Bottom padding for safe area
                            Spacer()
                                .frame(height: geometry.safeAreaInsets.bottom + 40)
                        }
                    }
                }
                .glassSurface(cornerRadius: 26, tintOpacity: 0.08, strokeOpacity: 0.25, shadowOpacity: 0.2)
                .padding(.horizontal, 12)
                .padding(.top, 60)
                .ignoresSafeArea(edges: .bottom)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            // Focus immediately when view appears - no delay needed
            isSearchFocused = true
        }
    }
}

// MARK: - City Search Row

struct CitySearchRow: View {
    let city: CityData
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                // Flag emoji circle
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.1))
                        .frame(width: 40, height: 40)
                    
                    Text(city.flagEmoji)
                        .font(.system(size: 20))
                }
                
                // City info
                VStack(alignment: .leading, spacing: 4) {
                    Text(city.cityName)
                        .font(.system(size: 17, weight: .medium))
                        .foregroundColor(.white)
                    
                    Text(city.country)
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.6))
                }
                
                Spacer()
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 14)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Header Badges

enum HeaderBadge: String {
    case streak
    case visited
    case rank

    var title: String {
        switch self {
        case .streak: return "Streak"
        case .visited: return "Cities Visited"
        case .rank: return "Traveler Rank"
        }
    }

    var description: String {
        switch self {
        case .streak:
            return "Keep exploring to grow your streak."
        case .visited:
            return "Bookmark cities to count them as visited."
        case .rank:
            return "Complete trips to level up your rank."
        }
    }
}

struct BadgeButton: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(color)

                Text(value)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(Color(red: 0.12, green: 0.14, blue: 0.2))
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(Color.white)
                    .overlay(
                        Capsule()
                            .stroke(Color.black.opacity(0.08), lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.25), radius: 10, x: 0, y: 8)
            )
        }
        .buttonStyle(PlainButtonStyle())
        .accessibilityLabel("\(title) \(value)")
    }
}

struct BadgePopup: View {
    let badge: HeaderBadge
    let onDismiss: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.35)
                .ignoresSafeArea()
                .onTapGesture(perform: onDismiss)

            VStack(spacing: 12) {
                Text(badge.title)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)

                Text(badge.description)
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)

                Button(action: onDismiss) {
                    Text("Got it")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .fill(Color.white.opacity(0.12))
                        )
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Color(red: 0.08, green: 0.12, blue: 0.2))
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .stroke(Color.white.opacity(0.12), lineWidth: 1)
                    )
            )
            .padding(.horizontal, 32)
        }
    }
}

// MARK: - Bookmarked View

struct BookmarkedView: View {
    @Binding var isPresented: Bool
    let cities: [CityData]
    let onBookmarkToggle: (UUID) -> Void
    let onSelect: (CityData) -> Void
    
    var bookmarkedCities: [CityData] {
        cities.filter { $0.isBookmarked }
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Dimmed background - covers everything including tab bar
                Color.black.opacity(0.4)
                    .ignoresSafeArea()
                    .onTapGesture {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                            isPresented = false
                        }
                    }
                
                // Bookmarked card - extends to bottom edge
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Button(action: {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                                isPresented = false
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.1))
                                    .frame(width: 36, height: 36)
                                
                                Image(systemName: "xmark")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                        
                        Spacer()
                        
                        Text("Bookmarked")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        // Placeholder for symmetry
                        Circle()
                            .fill(Color.clear)
                            .frame(width: 36, height: 36)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 20)
                    
                    // Bookmarked cities list
                    ScrollView(showsIndicators: false) {
                        VStack(alignment: .leading, spacing: 0) {
                            if bookmarkedCities.isEmpty {
                                VStack(spacing: 16) {
                                    Image(systemName: "bookmark")
                                        .font(.system(size: 48))
                                        .foregroundColor(.white.opacity(0.3))
                                    
                                    Text("No bookmarked cities")
                                        .font(.system(size: 17, weight: .medium))
                                        .foregroundColor(.white.opacity(0.6))
                                    
                                    Text("Bookmark cities to see them here")
                                        .font(.system(size: 15))
                                        .foregroundColor(.white.opacity(0.4))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.top, 60)
                            } else {
                                Text("\(bookmarkedCities.count) Bookmarked")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 20)
                                    .padding(.bottom, 16)
                                
                                VStack(spacing: 0) {
                                    ForEach(Array(bookmarkedCities.enumerated()), id: \.element.id) { index, city in
                                        BookmarkedCityRow(
                                            city: city,
                                            onBookmarkToggle: {
                                                onBookmarkToggle(city.id)
                                            },
                                            onSelect: {
                                                onSelect(city)
                                            }
                                        )
                                        
                                        if index < bookmarkedCities.count - 1 {
                                            Rectangle()
                                                .fill(Color.white.opacity(0.08))
                                                .frame(height: 1)
                                                .padding(.leading, 68)
                                        }
                                    }
                                }
                                .glassSurface(cornerRadius: 16, tintOpacity: 0.06, strokeOpacity: 0.2, shadowOpacity: 0.1)
                                .padding(.horizontal, 16)
                            }
                            
                            // Bottom padding for safe area
                            Spacer()
                                .frame(height: geometry.safeAreaInsets.bottom + 40)
                        }
                    }
                }
                .glassSurface(cornerRadius: 26, tintOpacity: 0.08, strokeOpacity: 0.25, shadowOpacity: 0.2)
                .padding(.horizontal, 12)
                .padding(.top, 60)
                .ignoresSafeArea(edges: .bottom)
            }
        }
        .ignoresSafeArea()
    }
}

// MARK: - Bookmarked City Row

struct BookmarkedCityRow: View {
    let city: CityData
    let onBookmarkToggle: () -> Void
    let onSelect: () -> Void
    
    var body: some View {
        HStack(spacing: 14) {
            // Flag emoji circle
            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 40, height: 40)
                
                Text(city.flagEmoji)
                    .font(.system(size: 20))
            }
            
            // City info
            VStack(alignment: .leading, spacing: 4) {
                Text(city.cityName)
                    .font(.system(size: 17, weight: .medium))
                    .foregroundColor(.white)
                
                HStack(spacing: 8) {
                    Text(city.country)
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.6))
                    
                    Text("•")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.4))
                    
                    HStack(spacing: 3) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 11))
                            .foregroundColor(.yellow)
                        
                        Text(String(format: "%.1f", city.rating))
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
            }
            
            Spacer()
            
            // Bookmark button
            Button(action: onBookmarkToggle) {
                Image(systemName: "bookmark.fill")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(Color(red: 0.3, green: 0.5, blue: 0.9))
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 14)
        .contentShape(Rectangle())
        .onTapGesture(perform: onSelect)
    }
}

#Preview {
    WeatherHomeView()
}
