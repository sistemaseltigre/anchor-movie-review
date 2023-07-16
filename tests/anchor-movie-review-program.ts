import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { assert, expect } from "chai"
import fs from "fs"
const idl = JSON.parse(fs.readFileSync("./target/idl/movie_review.json", "utf8"));


describe("anchor-movie-review-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const programId = new anchor.web3.PublicKey('843RUyD9LmhfhuSHrpFc4G8VTFxTVEFdkHSsC8By3py2');
  const program = new Program(idl, programId, provider); 

  const movie = {
    title: "Elchuo161",
    description: "This is a new movie and it is",
    rating: 3,
  }

  const [moviePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
    programId
  )

  it("Movie review is added`", async () => {
    // Add your test here.
    const tx = await program.methods.addMovieReview(movie.title, movie.description, movie.rating).accounts({
      movieReview: moviePda
    }).rpc()
  
    const account = await program.account.movieAccountState.fetch(moviePda)

    expect(movie.title === account.title)
    expect(movie.rating === account.rating)
    expect(movie.description === account.description)
    expect(account.reviewer === provider.wallet.publicKey)  
  })

  it("Movie review is updated`", async () => {
    const newDescription = "Wow this is new"
    const newRating = 4
  
    const tx = await program.methods
      .updateMovieReview(movie.title, newDescription, newRating)
      .accounts({
        movieReview: moviePda
      })
      .rpc()
  
    const account = await program.account.movieAccountState.fetch(moviePda)
     expect(movie.title === account.title)
    expect(newRating === account.rating)
    expect(newDescription === account.description)
    expect(account.reviewer === provider.wallet.publicKey)
   })

  it("Deletes a movie review", async () => {
    const tx = await program.methods
      .deleteMovieReview(movie.title)
      .accounts({
      movieReview: moviePda
      })
      .rpc()
  })
})
