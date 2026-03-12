import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Time "mo:base/Time";
import Int "mo:base/Int";

import Types "types";

module {

  // Deterministic random number generator helper
  private func nextRandom(seed : Nat) : (Nat, Float) {
    let a : Nat = 1664525;
    let c : Nat = 1013904223;
    let m : Nat = 4294967296; // 2^32
    let newSeed = (a * seed + c) % m;
    let val = Float.fromInt(newSeed) / Float.fromInt(m);
    (newSeed, val)
  };

  // Generate a random weather event based on season, considering infrastructure defenses
  public func generateEvent(season: Types.Season, entropy: Nat, hasSprayer: Bool) : ?Types.WeatherEvent {
    
    var currentSeed = entropy;
    let (s1, roll) = nextRandom(currentSeed);
    currentSeed := s1;
    
    var eventType : ?Types.Weather = null;
    var impactDesc = "";
    var severity = 0.0;
    var mitigated = false;

    switch (season) {
      case (#Spring) {
        // Spring: 20% Late Frost, 15% Disease, 15% Rainy
        if (roll < 0.20) {
          eventType := ?#Frost;
          impactDesc := "Late Frost! Protect young buds.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.4 + (r2 * 0.4); // 0.4 - 0.8
        } else if (roll < 0.35) {
          eventType := ?#DiseaseOutbreak; 
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          
          if (hasSprayer) {
            impactDesc := "Monilinia fungus detected, but your Sprayers neutralized the threat.";
            severity := 0.0;
            mitigated := true;
          } else {
            impactDesc := "Monilinia fungus spreading! Flower blight reducing yield.";
            severity := 0.3 + (r2 * 0.3); // 0.3 - 0.6
          };
        } else if (roll < 0.50) {
          eventType := ?#Rainy;
          impactDesc := "Steady Rain. Good for soil, but high disease risk.";
          severity := 0.3 + (roll * 0.4);
        } else {
          // 50% Sunny
        };
      };

      case (#Summer) {
        // Summer: 20% Drought, 15% Heatwave, 20% Pest Outbreak, 10% Rainy
        if (roll < 0.20) {
          eventType := ?#Drought;
          impactDesc := "Severe Drought conditions! Water sources depleting.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.7 + (r2 * 0.3); // 0.7 - 1.0
        } else if (roll < 0.35) {
          eventType := ?#Heatwave;
          impactDesc := "Heatwave alert! Trees under stress.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.6 + (r2 * 0.4); // 0.6 - 1.0
        } else if (roll < 0.55) {
          eventType := ?#PestOutbreak; 
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          
          if (hasSprayer) {
            impactDesc := "Cherry Fruit Flies repelled by active Sprayer defenses.";
            severity := 0.0;
            mitigated := true;
          } else {
            impactDesc := "Cherry Fruit Fly infestation! Larvae damaging fruit yield.";
            severity := 0.4 + (r2 * 0.4); // 0.4 - 0.8
          };
        } else if (roll < 0.65) {
          eventType := ?#Rainy;
          impactDesc := "Summer Storms. Provides much-needed water.";
          severity := 0.5;
        } else {
           // 35% Sunny
        };
      };

      case (#Autumn) {
        // Autumn: 10% Early Frost, 10% Flood, 30% Rainy
        if (roll < 0.10) {
          eventType := ?#Frost;
          impactDesc := "Early Frost. Harvest quickly!";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.3 + (r2 * 0.4);
        } else if (roll < 0.20) {
          eventType := ?#Flood;
          impactDesc := "Catastrophic Autumn Floods impacting the region.";
          let (s2, r2) = nextRandom(currentSeed);
          currentSeed := s2;
          severity := 0.8 + (r2 * 0.2); // 0.8 - 1.0
        } else if (roll < 0.50) {
          eventType := ?#Rainy;
          impactDesc := "Persistent Rain. Soil becoming waterlogged.";
          severity := 0.6;
        } else {
          // 50% Sunny / Normal
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
        } else {
          // 75% Normal Winter
        };
      };
    };

    switch (eventType) {
      case (null) { null };
      case (?weather) {
        ?{
          weather = weather;
          severity = severity;
          season = 0; // Handled by caller to use actual numeric season 
          impact = impactDesc;
          mitigated = mitigated;
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
      case (#Flood) { "Flood" };
      case (#PestOutbreak) { "Pest Outbreak" };
      case (#DiseaseOutbreak) { "Disease Outbreak" };
    };
  };

};
