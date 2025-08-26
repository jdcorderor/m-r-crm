// Function for calculating patient's age
const calculateAge = (date: string) => {
    const birth = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
        
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

export default calculateAge;