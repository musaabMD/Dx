//
//  CityViewModel.swift
//  tripdb
//
//  Created by Musaab-HQ on 17/01/2026.
//

import Foundation
import SwiftUI
import Combine

class CityViewModel: ObservableObject {
    @Published var cities: [CityData] = []
    // Optional: Add your Unsplash access key from https://unsplash.com/developers for better results
    private let unsplashAccessKey: String? = nil
    
    init() {
        loadCities()
    }
    
    @MainActor
    func loadCities() {
        // Initial cities data: (cityName, country, countryCode, costPerDay, flightHours, flightCost, weather, temp, rating, reviewCount)
        let initialCities: [(String, String, String, Double, Int, Double, String, Int, Double, Int)] = [
            ("Istanbul", "Turkey", "TR", 45.0, 3, 280.0, "Sunny", 18, 4.7, 1250),
            ("Bali", "Indonesia", "ID", 35.0, 12, 650.0, "Partly Cloudy", 28, 4.9, 3200),
            ("Bangkok", "Thailand", "TH", 30.0, 10, 520.0, "Cloudy", 32, 4.6, 2100),
            ("Vienna", "Austria", "AT", 55.0, 2, 320.0, "Mostly Cloudy", 8, 4.8, 980),
            ("Geneva", "Switzerland", "CH", 65.0, 1, 380.0, "Sunny", 5, 4.5, 750)
        ]
        
        cities = initialCities.map { cityInfo in
            CityData(
                cityName: cityInfo.0,
                country: cityInfo.1,
                countryCode: cityInfo.2,
                costPerDayPerPerson: cityInfo.3,
                flightTimeHours: cityInfo.4,
                flightCostPerPerson: cityInfo.5,
                weatherNow: cityInfo.6,
                weatherTemperature: cityInfo.7,
                rating: cityInfo.8,
                reviewCount: cityInfo.9,
                imageURL: nil,
                isBookmarked: false
            )
        }
        
        // Load images from Unsplash
        Task(priority: .utility) {
            await loadCityImages()
        }
    }
    
    private func loadCityImages() async {
        let snapshot = await MainActor.run { cities }
        var updated = snapshot
        
        await withTaskGroup(of: (Int, String?).self) { group in
            for (index, city) in snapshot.enumerated() {
                group.addTask {
                    let imageURL = await self.fetchUnsplashImage(for: city.cityName)
                    return (index, imageURL)
                }
            }
            
            for await (index, imageURL) in group {
                updated[index].imageURL = imageURL
            }
        }
        
        await MainActor.run {
            cities = updated
        }
    }
    
    private func fetchUnsplashImage(for cityName: String) async -> String? {
        let query = cityName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? cityName
        
        // If API key is available, use Unsplash API for better results
        if let accessKey = unsplashAccessKey {
            let urlString = "https://api.unsplash.com/photos/random?query=\(query)&orientation=landscape&client_id=\(accessKey)"
            
            guard let url = URL(string: urlString) else { return nil }
            
            do {
                let (data, _) = try await URLSession.shared.data(from: url)
                let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                
                if let urls = json?["urls"] as? [String: Any],
                   let regularURL = urls["regular"] as? String {
                    return regularURL
                }
            } catch {
                print("Error fetching Unsplash image: \(error)")
            }
        }
        
        // Fallback: Use Unsplash Source API (works without key but less reliable)
        // Format: https://source.unsplash.com/800x600/?cityname
        return "https://source.unsplash.com/800x600/?\(query)"
    }
    
    func toggleBookmark(for cityId: UUID) {
        if let index = cities.firstIndex(where: { $0.id == cityId }) {
            var updatedCities = cities
            updatedCities[index].isBookmarked.toggle()
            cities = updatedCities
        }
    }
}
