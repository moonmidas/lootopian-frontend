// Order of sections
// 0. Background
// 1. Body
// 2. Eyes
// 3. Pants
// 4. Shoes
// 5. Shirt
// 6. Waist
// 7. Gloves
// 8. Wrists
// 9. Shoulders
// 10. Neck
// 11. Face Accessories
// 12. Hair
// 13. Hat

export default function sectionToLabel(section) {
    switch (section) {
        case 0:
            return "bg";
        case 1:
            return "body";
        case 2:
            return "eyes";
        case 3:
            return "pants";
        case 4:
            return "shoes";
        case 5:
            return "shirt";
        case 6:
            return "waist";
        case 7:
            return "gloves";
        case 8:
            return "wrists";
        case 9:
            return "shoulders";
        case 10:
            return "neck";
        case 11:
            return "face_accessories";
        case 12:
            return "hair";
        case 13:
            return "hat";
        default:
            return "";
    }
}

