const Calculations = () => {
  return (
    <div id="calculations-container">
      <h1>Calculations</h1>
      {'Rashod topliva, Cena topliva'}
      <form>
        <div>
          <label htmlFor="fuel-consumption">Rashod topliva:</label>
          <input type="number" id="fuel-consumption" name="fuel-consumption" />
        </div>
        <div>
          <label htmlFor="fuel-price">Cena topliva:</label>
          <input type="number" id="fuel-price" name="fuel-price" />
        </div>
        <button type="submit">Clicky Clicky !</button>
      </form>
    </div>
  );
}

export default Calculations;