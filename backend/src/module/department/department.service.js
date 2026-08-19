import prisma from "../../config/database.js";
import { Prisma } from "@prisma/client";

// create department 
export const createDepartment = async (departmentData) => {
    const { name, headDoctorId, ...data } = departmentData;

    // check if department name already exists
    const existingDepartment = await prisma.department.findUnique({
        where: { name },
    });
    if (existingDepartment) {
        throw new Error("Department with this name already exists");
    }

    // if headDoctorId is provided, check if doctor exists or not
    if (headDoctorId) {
        const doctor = await prisma.doctor.findUnique({
            where: { id: headDoctorId },
            include: { user: true }
        });

        if (!doctor) {
            throw new Error("Head doctor not found");
        }

        // check if doctor is already head of another department
        const existingHead = await prisma.department.findFirst({
            where: {
                headDoctorId,
                NOT: { headDoctorId: null }
            }
        });

        if (existingHead) {
            throw new Error("This doctor is already head of another department");
        }
    }

    const department = await prisma.department.create({
        data: {
            name,
            headDoctorId,
            ...data
        },
        include: {
            headDoctor: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    // create audit log
    await prisma.auditLog.create({
        data: {
            userId: department.headDoctorId || "system", // Ensure there's a valid userId, maybe system or admin Id
            action: 'CREATE',
            description: `Department ${department.name} created`,
        },
    });

    return department;
};

// get all departments
export const getAllDepartments = async (query = {}) => {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
        where.name = { contains: search };
    }
    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    const [departments, total] = await Promise.all([
        prisma.department.findMany({
            where,
            include: {
                headDoctor: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                _count: {
                    select: { doctors: true }
                }
            },
            skip: Number(skip),
            take: Number(limit),
            orderBy: { createdAt: "desc" }
        }),
        prisma.department.count({ where })
    ]);

    return {
        departments,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// get department by Id
export const getDepartmentById = async (departmentId) => {
    const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: {
            headDoctor: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            },
            doctors: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    doctors: true
                }
            }
        }
    });

    if (!department) {
        throw new Error("Department not found");
    }
    return department;
};

// update department
export const updateDepartment = async (departmentId, updateData) => {
    const { name, headDoctorId, ...data } = updateData;

    // check if department exists
    const existingDepartment = await prisma.department.findUnique({
        where: { id: departmentId },
    });
    if (!existingDepartment) {
        throw new Error("Department not found");
    }

    // check if department name already exists (if name is being updated)
    if (name && name !== existingDepartment.name) {
        const nameExists = await prisma.department.findUnique({
            where: { name }
        });
        if (nameExists) {
            throw new Error("Department with this name is already taken");
        }
    }

    // if headDoctorId is provided, check if doctor exists or not
    if (headDoctorId) {
        const doctor = await prisma.doctor.findUnique({
            where: { id: headDoctorId },
            include: { user: true }
        });

        if (!doctor) {
            throw new Error("Head doctor not found");
        }

        // check if doctor is already head of another department
        const existingHead = await prisma.department.findFirst({
            where: {
                headDoctorId,
                id: { not: departmentId },
                NOT: { headDoctorId: null }
            }
        });

        if (existingHead) {
            throw new Error("This doctor is already head of another department");
        }
    }

    const department = await prisma.department.update({
        where: { id: departmentId },
        data: {
            name,
            headDoctorId,
            ...data
        },
        include: {
            headDoctor: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true
                        }
                    }
                }
            },
            doctors: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            }
        }
    });

    return department;
};

// get department doctors
export const getDepartmentDoctors = async (departmentId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const department = await prisma.department.findUnique({
        where: { id: departmentId }
    });

    if (!department) {
        throw new Error("Department not found");
    }

    const [doctors, total] = await Promise.all([
        prisma.doctor.findMany({
            where: { departmentId },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true
                    }
                }
            },
            skip: Number(skip),
            take: Number(limit),
            orderBy: { createdAt: "desc" }
        }),
        prisma.doctor.count({ where: { departmentId } })
    ]);

    return {
        doctors,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// add doctor to department
export const addDoctorToDepartment = async (departmentId, doctorId) => {
    const department = await prisma.department.findUnique({
        where: { id: departmentId }
    });
    if (!department) {
        throw new Error("Department not found");
    }

    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId }
    });
    if (!doctor) {
        throw new Error("Doctor not found");
    }

    if (doctor.departmentId === departmentId) {
        throw new Error("Doctor is already in this department");
    }

    const updatedDoctor = await prisma.doctor.update({
        where: { id: doctorId },
        data: { departmentId },
        include: {
            user: {
                select: {
                    fullName: true,
                    email: true,
                    phone: true
                }
            }
        }
    });

    return updatedDoctor;
};

// remove doctor from department
export const removeDoctorFromDepartment = async (departmentId, doctorId) => {
    const department = await prisma.department.findUnique({
        where: { id: departmentId }
    });
    if (!department) {
        throw new Error("Department not found");
    }

    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId }
    });
    if (!doctor) {
        throw new Error("Doctor not found");
    }

    if (doctor.departmentId !== departmentId) {
        throw new Error("Doctor is not in this department");
    }

    const updatedDoctor = await prisma.doctor.update({
        where: { id: doctorId },
        data: { departmentId: null },
        include: {
            user: {
                select: {
                    fullName: true,
                    email: true,
                    phone: true
                }
            }
        }
    });

    return updatedDoctor;
};

// delete department
export const deleteDepartment = async (departmentId) => {
    const department = await prisma.department.findUnique({
        where: { id: departmentId }
    });
    if (!department) {
        throw new Error("Department not found");
    }

    await prisma.department.delete({
        where: { id: departmentId }
    });

    return { message: "Department deleted successfully" };
};