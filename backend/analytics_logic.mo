import Types "types";
import Array "mo:base/Array";
import Int "mo:base/Int";

module AnalyticsLogic {

  // Steampunk Persona: All business advice must use Victorian/Steampunk terminology
  // Triggers & Thresholds:
  // 1. Labor Burden: If laborCosts > (revenue * 45%) -> Advise on mechanical shakers ("Fiscal Hemorrhage").
  // 2. Soil Fatigue: If orchardQuality < 40 -> Demand Organic Treatments ("Orchard Fatigue").
  // 3. Retail Opportunity: If unmetRetailDemand > 20% -> Warn about "Wholesale Vultures".
  // 4. Spoilage Crisis: If actualSpoilage > 15% -> Recommend better labor or storage upgrades ("Rot is consuming our yields...").

  public func generateInsights(report: Types.YearlyReport, farm: Types.PlayerFarm) : [Text] {
    var insights : [Text] = [];

    // 1. Labor Burden
    let laborThreshold = (report.totalRevenue * 45) / 100;
    if (report.laborCosts > laborThreshold) {
      insights := Array.append(insights, ["Fiscal Hemorrhage detected! The manual labor costs are bleeding our coffers dry. We must modernize immediately. I strongly urge the acquisition of mechanical Shakers to replace these expensive hands."]);
    };

    // 2. Soil Fatigue
    // Calculate average quality across all parcels
    var totalQuality : Nat = 0;
    if (farm.parcels.size() > 0) {
      for (parcel in farm.parcels.vals()) {
        totalQuality += parcel.quality;
      };
      let avgQuality = totalQuality / farm.parcels.size();
      
      if (avgQuality < 40) {
        insights := Array.append(insights, ["Severe Orchard Fatigue! The soil is weeping dust. Our precious estates are degrading rapidly. We must infuse the earth with Organic Treatments and aggressive NPK fertilizers before the next harvest is entirely compromised."]);
      };
    };

    // 3. Retail Opportunity
    // We don't have unmet demand directly, but if retailVolume represents > 50% of the harvest but wholesale revenue is low.
    // Or if wholesale volume is huge compared to retail. Let's use wholesaleVolume vs retailVolume.
    // If retailVolume > wholesaleVolume, meaning retail is our main thing but we still sell wholesale... actually the prompt says:
    // "If unmetRetailDemand > 20% -> Warn about Wholesale Vultures."
    // Let's approximate: if wholesaleVolume > (retailVolume * 2), meaning we are heavily relying on wholesale vultures.
    if (report.wholesaleVolume > (report.retailVolume * 2) and report.wholesaleVolume > 0) {
      insights := Array.append(insights, ["Beware the Wholesale Vultures! We are practically gifting our exquisite cherries to the distribution barons. We must expand our local Retail presence to capture the true value of our harvest."]);
    };

    // 4. Spoilage Crisis
    // If totalHarvested vs what was actually sold (retailVolume + wholesaleVolume) shows a gap > 15%
    let totalSold = report.retailVolume + report.wholesaleVolume;
    if (report.totalHarvested > totalSold) {
      let spoilage = Int.abs((report.totalHarvested : Int) - (totalSold : Int));
      let spoilageThreshold = (report.totalHarvested * 15) / 100;
      
      if (spoilage > spoilageThreshold) {
        insights := Array.append(insights, ["Rot is consuming our yields! A terrifying volume of our harvest has perished in the warehouses. I implore you: secure better qualified labor next Spring, or construct advanced Cold Storage facilities to preserve our wealth."]);
      };
    };
    
    // If everything is peachy
    if (insights.size() == 0) {
      insights := Array.append(insights, ["A most splendid year! The engines of our agricultural enterprise hum with perfect Steampunk precision. Maintain the course, Governor."]);
    };

    return insights;
  };

};
