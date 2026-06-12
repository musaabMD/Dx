//
//  CityData.swift
//  tripdb
//
//  Created by Musaab-HQ on 17/01/2026.
//

import Foundation

struct CityData: Identifiable, Codable, Hashable {
    let id: UUID
    let cityName: String
    let country: String
    let countryCode: String // ISO country code for flag emoji
    let costPerDayPerPerson: Double
    let flightTimeHours: Int
    let flightCostPerPerson: Double
    let weatherNow: String
    let weatherTemperature: Int
    let rating: Double
    let reviewCount: Int
    var imageURL: String?
    var isBookmarked: Bool
    
    init(
        id: UUID = UUID(),
        cityName: String,
        country: String,
        countryCode: String,
        costPerDayPerPerson: Double,
        flightTimeHours: Int,
        flightCostPerPerson: Double,
        weatherNow: String,
        weatherTemperature: Int,
        rating: Double,
        reviewCount: Int,
        imageURL: String? = nil,
        isBookmarked: Bool = false
    ) {
        self.id = id
        self.cityName = cityName
        self.country = country
        self.countryCode = countryCode
        self.costPerDayPerPerson = costPerDayPerPerson
        self.flightTimeHours = flightTimeHours
        self.flightCostPerPerson = flightCostPerPerson
        self.weatherNow = weatherNow
        self.weatherTemperature = weatherTemperature
        self.rating = rating
        self.reviewCount = reviewCount
        self.imageURL = imageURL
        self.isBookmarked = isBookmarked
    }
    
    var flagEmoji: String {
        let base: UInt32 = 127397
        let code = countryCode.uppercased()
        guard code.count == 2 else { return "🏳️" }
        return code.unicodeScalars.compactMap { scalar in
            guard let flagScalar = UnicodeScalar(base + scalar.value) else { return nil }
            return String(flagScalar)
        }.joined()
    }
    
    var formattedFlightDuration: String {
        "\(flightTimeHours)h"
    }
}
