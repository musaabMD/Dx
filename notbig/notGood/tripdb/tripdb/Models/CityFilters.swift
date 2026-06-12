import Foundation

struct CityFilters: Equatable {
    var topRated = false
    var budgetFriendly = false
    var shortFlight = false
    var warmWeather = false

    var activeCount: Int {
        [topRated, budgetFriendly, shortFlight, warmWeather].filter { $0 }.count
    }

    func apply(to cities: [CityData]) -> [CityData] {
        var filtered = cities

        if topRated {
            filtered = filtered.filter { $0.rating >= 4.7 }
        }

        if budgetFriendly {
            filtered = filtered.filter { $0.costPerDayPerPerson <= 50 }
        }

        if shortFlight {
            filtered = filtered.filter { $0.flightTimeHours <= 4 }
        }

        if warmWeather {
            filtered = filtered.filter { $0.weatherTemperature >= 20 }
        }

        return filtered
    }
}
