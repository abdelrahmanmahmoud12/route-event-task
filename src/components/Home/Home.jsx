import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from 'chart.js';
import style from'./Home.module.css'
ChartJS.register(CategoryScale, LinearScale, BarElement);

export default function Home() {
  const [data, setData] = useState({ customers: [], transactions: [] });
  const [filteredData, setFilteredData] = useState({ customers: [], transactions: [] });
  const [customerFilter, setCustomerFilter] = useState('');
  const [transactionFilter, setTransactionFilter] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    axios.get('http://localhost:4000/allData')
      .then(response => {
        setData(response.data);
        setFilteredData(response.data);
        updateChart(response.data.transactions);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customerFilter, transactionFilter]);

  const applyFilters = () => {
    const filteredCustomers = data.customers.filter(customer =>
      customer.name.toLowerCase().includes(customerFilter.toLowerCase())
    );

    const filteredTransactions = data.transactions.filter(transaction =>
      transaction.amount.toString().includes(transactionFilter)
    );

    const filteredCustomerIds = filteredCustomers.map(customer => customer.id);

    const finalTransactions = filteredTransactions.filter(transaction =>
      filteredCustomerIds.includes(transaction.customer_id)
    );

    setFilteredData({
      customers: filteredCustomers,
      transactions: finalTransactions,
    });

    if (customerFilter === '') {
      updateChart(data.transactions);
    } else {
      updateChart(finalTransactions);
    }
  };

  const updateChart = (transactions) => {
    const transactionsByDate = transactions.reduce((acc, transaction) => {
      acc[transaction.date] = (acc[transaction.date] || 0) + transaction.amount;
      return acc;
    }, {});

    const labels = Object.keys(transactionsByDate);
    const dataValues = Object.values(transactionsByDate);

    setChartData({
      labels: labels,
      datasets: [{
        label: 'Total Transaction Amount per Day',
        data: dataValues,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      }]
    });
  };
// 
  return (
    <div className={`${style.mainBg} container p-5 my-5  rounded-5`} >  
      <h1 className="text-center mb-4">Customer Transactions</h1>
      <div className="row justify-content-center mb-4">
        <div className="col-lg-5 g-2">
          <input
            type="text"
            className="form-control shadow-none"
            placeholder="Filter by customer name"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          />
        </div>
        <div className="col-lg-5 g-2">
          <input
            type="text"
            className="form-control shadow-none"
            placeholder="Filter by transaction amount"
            value={transactionFilter}
            onChange={(e) => setTransactionFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <table className="table table-bordered">
          <thead className="thead-dark">
            <tr>
              <th scope="col" className='text-center'>#</th>
              <th scope="col" className='text-center'>Customer</th>
              <th scope="col" className='text-center'>Transaction Amount</th>
              <th scope="col" className='text-center'>Transaction Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.customers.map((customer, customerIndex) => {
              const customerTransactions = filteredData.transactions.filter(transaction => transaction.customer_id === customer.id);
              return (
                <React.Fragment key={customer.id}>
                  {customerTransactions.map((transaction, transactionIndex) => (
                    <tr key={transaction.id}>
                      {transactionIndex === 0 && (
                        <>
                          <th scope="row" rowSpan={customerTransactions.length} className="align-middle text-center">{customerIndex + 1}</th>
                          <td className='text-center align-middle' rowSpan={customerTransactions.length}>{customer.name}</td>
                        </>
                      )}
                      <td className='text-center'>{transaction.amount}</td>
                      <td className='text-center'>{transaction.date}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="row mt-5 justify-content-center">
        <h2 className="text-center">Transaction Amount Per Day</h2>
        <div className="col-lg-8 ">
        <Bar data={chartData} />
        </div>
      </div>
    </div>
  );
}
