interface TcasEntry {
  university_name_th: string;
  university_name_en: string;
  campus_name_th: string;
  campus_name_en: string;
  faculty_name_th: string;
  faculty_name_en: string;
}

interface UniversityOption {
  id: string;
  name_th: string;
  name_en: string;
  campus_th: string;
  campus_en: string;
}

interface FacultyOption {
  id: string;
  name_th: string;
  name_en: string;
}

// Import JSON data
import tcasDataRaw from '../../tcas_cleaned.json';
const tcasData: TcasEntry[] = tcasDataRaw as TcasEntry[];

export function getUniversityOptions(searchText: string): UniversityOption[] {
  try {
    // Create unique university-campus combinations
    const uniqueUniversities = new Map<string, UniversityOption>();
    
    tcasData.forEach(entry => {
      const key = `${entry.university_name_th}-${entry.campus_name_th}`;
      if (!uniqueUniversities.has(key)) {
        uniqueUniversities.set(key, {
          id: key,
          name_th: entry.university_name_th,
          name_en: entry.university_name_en,
          campus_th: entry.campus_name_th,
          campus_en: entry.campus_name_en,
        });
      }
    });

    // Filter based on search text
    const searchLower = searchText.toLowerCase();
    return Array.from(uniqueUniversities.values()).filter(uni => 
      uni.name_th.toLowerCase().includes(searchLower) ||
      uni.name_en.toLowerCase().includes(searchLower) ||
      uni.campus_th.toLowerCase().includes(searchLower) ||
      uni.campus_en.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error loading TCAS data:', error);
    return [];
  }
}

export function getFacultyOptions(university: string, campus: string): FacultyOption[] {
  try {
    // Filter faculties for the selected university and campus
    const uniqueFaculties = new Map<string, FacultyOption>();
    
    tcasData
      .filter(entry => 
        entry.university_name_th === university &&
        entry.campus_name_th === campus
      )
      .forEach(entry => {
        const key = `${entry.faculty_name_th}`;
        if (!uniqueFaculties.has(key)) {
          uniqueFaculties.set(key, {
            id: key,
            name_th: entry.faculty_name_th,
            name_en: entry.faculty_name_en,
          });
        }
      });

    return Array.from(uniqueFaculties.values());
  } catch (error) {
    console.error('Error loading TCAS data:', error);
    return [];
  }
}