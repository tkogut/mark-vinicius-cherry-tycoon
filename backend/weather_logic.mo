import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Random "mo:base/Random";

import Types "types";

module {

  // Deterministic random number generator helper
  private func nextRandom(seed : Nat) : (Nat, Float) {
    // Linear Congruential Generator parameters
    let a : Nat = 1664525;
    let c : Nat = 1013904223;
    let m : Nat = 4294967296; // 2^32

    let newSeed = (a * seed + c) % m;
    let val = Float.fromInt(newSeed) / Float.fromInt(m);
    (newSeed, val)
  };

  // Generate a random weather event based on season
  public func generateWeatherEvent(season: Types.Season, entropy: Nat) : ?Types.WeatherEvent {
    
    var currentSeed = entropy;
    let (s1, roll) = nextRandom(currentSeed);
    currentSeed := s1;
    
    // Default: Sunny (No event)
    var eventType : ?Types.Weather = null;
    var impactDesc = "";
    var severity = 0.0;

    switch (season) {
      case (#Spring) {
        // Spring: 15% Late Frost, 20% Heavy Rain
        if (roll < 0.15) {
          eventType := ?#Frost;
          impactDesc := "Late Frost! Protect young buds.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.4 + (r2 * 0.4); // 0.4 - 0.8
        } else if (roll < 0.35) {
          eventType := ?#Rainy; // Representing Heavy Rain
          impactDesc := "Heavy Spring Rain. Monitoring disease risk.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.3 + (r2 * 0.4);
        };
      };
      case (#Summer) {
        // Summer: 20% Drought, 15% Heatwave, 5% Hail
        if (roll < 0.20) {
          eventType := ?#Drought;
          impactDesc := "Drought conditions detected. Irrigation critical.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.5 + (r2 * 0.5);
        } else if (roll < 0.35) {
          eventType := ?#Heatwave;
          impactDesc := "Heatwave alert! Trees under stress.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.6 + (r2 * 0.4);
        } else if (roll < 0.40) {
          eventType := ?#Rainy; // Representing Hailstorm for now (as damaging rain)
          impactDesc := "Hailstorm! Potential physical damage.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.7 + (r2 * 0.3);
        };
      };
      case (#Autumn) {
        // Autumn: 10% Early Frost, 15% Storm
        if (roll < 0.10) {
          eventType := ?#Frost;
          impactDesc := "Early Frost. Harvest quickly!";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.3 + (r2 * 0.4);
        } else if (roll < 0.25) {
          eventType := ?#Rainy; // Storm
          impactDesc := "Autumn Storms. Field work delayed.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.4 + (r2 * 0.4);
        };
      };
      case (#Winter) {
        // Winter: 25% Deep Freeze
        if (roll < 0.25) {
          eventType := ?#Frost; // Deep Freeze
          impactDesc := "Deep Freeze. Check winter protection.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.8 + (r2 * 0.2);
        };
      };
    };

    switch (eventType) {
      case (null) { null };
      case (?weather) {
        ?{
          weather = weather;
          severity = severity;
          season = 0; // Will be set by caller
          impact = impactDesc;
        }
      };
    };
  };

  public func getDescription(weather: Types.Weather) : Text {
    switch (weather) {
      case (#Sunny) { "Sunny" };
      case (#Rainy) { "Rainy" };
      case (#Frost) { "Frost" };
      case (#Drought) { "Drought" };
      case (#Heatwave) { "Heatwave" };
    };
  };

};
