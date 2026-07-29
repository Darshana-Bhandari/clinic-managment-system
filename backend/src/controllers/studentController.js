// Get All Students

export const getStudents = async (req, res) => {
    const students = [
        {
            id: 1,
            name: "Darshana",
            age: 19,
        },
        {
            id: 2,
            name: "Darsu",
            age: 20,
        },
    ];

    res.status(200).json({
        success: true,
        message: "Students fetched successfully",
        data: students,
    });
};