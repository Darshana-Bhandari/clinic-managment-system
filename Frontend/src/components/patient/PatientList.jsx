import React, { useEffect, useState } from 'react'
import {} from "react-icons/fi"
import toast from "react-hot-toast"
import { useSelector } from 'react-redux'
import { getAllPatients } from '../../services/patientServices.js'

const PatientList = () => {
    const {user} = useSelector((state)=> state.auth);
    const [patients, setPatients] = useState([])
    const[loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setpagination] = useState({page:1,limit:10,total:0,totalPages:0})
    const [search, setSearch] = useState('')
    const [gender, setGender]= useState('')
    const [bloodGroup, setBloodGroup]= useState('')

    // fetch patients 
    const fetchPatients = async (params ={})=>{
        setLoading(true)
        setError(null)
        try{
            const data = await getAllPatients({
                page:pagination.page,
                limit:pagination.limit,
                search,
                gender,
                bloodGroup,
                ...params,
            })
            setPatients(data.patients || data)

            if(data.pagination ) setpagination(data.pagination)

        }
        catch(error){
            const message = error.response?.data?.message || "Failed to fetch patients "
            setError(message);
            toast.error(message)

        }
    }
    // inital Fetch 
    useEffect(()=>{
        fetchPatients();
    },[pagination.page])

    //handlets
    const handleSearch =(e) =>{
        e.preventDefault();
        setpagination((p)=> ({...p, page:1}))
    }
    const handleReset =() =>{
        setSearch('');
        setGender('')
        setBloodGroup('');
        setpagination((p) =>({...p,page:1}))
        fetchPatients({page:1,search:'',gender:'',bloodGroup:''})
    }
    ///const handleDelete
    /// hanlepagechnage
    


  return (
   <>
   </>
  )
}

export default PatientList